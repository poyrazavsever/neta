import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Yetkisiz erişim' }), { status: 401 });
    }

    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const provider = appSettings?.ai_provider || "openai";
    const apiKey = appSettings?.api_key;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Ayarlardan AI Sağlayıcı ve API Anahtarı seçmelisiniz.' }), { status: 400 });
    }

    let model;
    if (provider === 'gemini') {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google('gemini-1.5-pro-latest');
    } else if (provider === 'groq') {
      const groq = createOpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
      model = groq('llama-3.1-8b-instant');
    } else {
      const openai = createOpenAI({ apiKey });
      model = openai('gpt-4o');
    }

    // Fetch finance data (last 30 days)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const { data: transactions } = await supabase.from('finance_transactions')
      .select('type, amount, category, transaction_date')
      .gte('transaction_date', pastDate.toISOString())
      .eq('user_id', user.id);

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ text: "Son 30 güne ait herhangi bir finansal işleminiz bulunmadığı için analiz yapamıyorum. Lütfen yeni gelir/gider ekleyin." }), { status: 200 });
    }

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const netProfit = totalIncome - totalExpense;

    const dataSummary = `Kullanıcının son 30 günlük finansal durumu:
- Toplam Gelir: ${totalIncome} $
- Toplam Gider: ${totalExpense} $
- Net Kâr: ${netProfit} $
- İşlem Sayısı: ${transactions.length}
İşlemler listesi:
${transactions.map(t => `- ${t.transaction_date.slice(0, 10)} | ${t.type === 'income' ? 'Gelir' : 'Gider'} | ${t.category} | ${t.amount}$`).join('\n')}`;

    const { text } = await generateText({
      model,
      system: `Sen profesyonel bir finans danışmanısın. Kullanıcıya verilen finansal verilere dayanarak kısa, motive edici ve yapıcı bir "Finansal Durum Raporu ve Tavsiye" sunmalısın. 
Gereksiz uzunluktan kaçın, direkt sadede gel. Sadece metin formatında, markdown başlıklar kullanarak (örn: ### Özet, ### Tavsiyeler) cevap ver. Türkçe konuş.`,
      prompt: `Lütfen aşağıdaki verilere göre bana bir finansal özet ve kâr/gider oranım için tavsiye ver:\n\n${dataSummary}`,
    });

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("AI Finance Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
