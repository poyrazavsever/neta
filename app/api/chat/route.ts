import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30; // Allow longer execution for tool calls

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Yetkisiz erişim', { status: 401 });
    }

    const { messages, sessionId, provider: clientProvider, apiKey: clientApiKey } = await req.json();

    // Read App Settings for Provider/API Key
    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const provider = clientProvider || appSettings?.ai_provider || "openai";
    const apiKey = clientApiKey || appSettings?.api_key || "";

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

    // Identify the latest user message to save to Supabase and use for RAG
    const latestMessage = messages[messages.length - 1];
    let ragContext = "";
    
    if (latestMessage && latestMessage.role === 'user' && latestMessage.content) {
      if (sessionId) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          role: "user",
          content: latestMessage.content,
        });
      }

      // Perform RAG search
      try {
        const { searchSimilarDocuments } = await import('@/lib/ai/embeddings');
        const similarDocs = await searchSimilarDocuments(user.id, latestMessage.content, provider, apiKey, 3);
        if (similarDocs && similarDocs.length > 0) {
          ragContext = "Aşağıda kullanıcının veri tabanından sistemin otomatik bulduğu geçmiş notlar ve veriler (RAG Context) bulunmaktadır. Gerektiğinde soruları yanıtlarken bunlardan faydalan:\n\n" + similarDocs.map((doc: any) => `- ${doc.content}`).join("\n");
        }
      } catch (err) {
        console.error("RAG araması başarısız:", err);
      }
    }

    const systemPrompt = `Sen kullanıcının kişisel Freelancer İş Asistanı ve Danışmanısın. Cognis Freelancer OS içinde yaşıyorsun.
Kullanıcının iş süreçlerini, projelerini ve finansal durumunu organize etmesine yardımcı oluyorsun.
Gerektiğinde araçları (tools) kullanarak sistemden güncel verileri çek ve doğrudan veri ekle.

${ragContext}

Aşağıdaki yeteneklere sahipsin:
- Finansal verileri listeleyebilir ve yeni finans kaydı (gelir/gider) girebilirsin.
- Görevleri okuyabilir ve yeni görevler ekleyebilirsin.
- Projeleri sorgulayabilir ve projelerin detaylarını/tasarım sistemini çekebilirsin.
Kullanıcıya her zaman proaktif, kısa ve profesyonel yanıtlar ver. Türkçe dilinde cevapla.`;

    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      tools: {
        getFinancialSummary: tool({
          description: 'Son X gündeki gelir ve gider işlemlerinin listesini getirir.',
          parameters: z.object({ days: z.number().default(30) }),
          execute: async ({ days }) => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - days);
            const { data } = await supabase.from('finance_transactions')
              .select('type, amount, category, transaction_date')
              .gte('transaction_date', pastDate.toISOString());
            return data || [];
          }
        }),
        listTasks: tool({
          description: 'Kullanıcının mevcut görevlerini belirli bir duruma göre listeler.',
          parameters: z.object({ status: z.enum(['todo', 'in_progress', 'completed', 'all']).default('all') }),
          execute: async ({ status }) => {
            let query = supabase.from('tasks').select('id, title, status, due_at');
            if (status !== 'all') query = query.eq('status', status);
            const { data } = await query.order('created_at', { ascending: false }).limit(20);
            return data || [];
          }
        }),
        createTask: tool({
          description: 'Sisteme yeni bir görev ekler.',
          parameters: z.object({ 
            title: z.string().describe('Görev başlığı'), 
            description: z.string().optional().describe('Görevin detayı') 
          }),
          execute: async ({ title, description }) => {
            const { data, error } = await supabase.from('tasks')
              .insert({ user_id: user.id, title, description, status: 'todo' })
              .select().single();
            if (error) return { success: false, error: error.message };
            return { success: true, task: data };
          }
        }),
        searchProjects: tool({
          description: 'Projeleri isimlerine veya durumlarına göre listeler',
          parameters: z.object({ status: z.enum(['active', 'planning', 'completed', 'paused', 'all']).default('active') }),
          execute: async ({ status }) => {
            let query = supabase.from('projects').select('id, name, status, progress, budget');
            if (status !== 'all') query = query.eq('status', status);
            const { data } = await query.limit(10);
            return data || [];
          }
        }),
        addFinanceTransaction: tool({
          description: 'Sisteme yeni bir finansal kayıt (gelir veya gider) ekler.',
          parameters: z.object({ 
            type: z.enum(['income', 'expense']).describe('income (gelir) veya expense (gider)'), 
            amount: z.number().describe('Tutar'), 
            category: z.string().describe('Kategori örn. Yazılım, Yemek, Vergi vb.')
          }),
          execute: async ({ type, amount, category }) => {
            const { data, error } = await supabase.from('finance_transactions')
              .insert({ 
                user_id: user.id, 
                type, 
                amount, 
                category, 
                transaction_date: new Date().toISOString() 
              })
              .select().single();
            if (error) return { success: false, error: error.message };
            return { success: true, transaction: data };
          }
        })
      },
      onFinish: async ({ text }) => {
        // Save assistant response to DB
        if (sessionId && text) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: text,
          });
        }
      }
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}
