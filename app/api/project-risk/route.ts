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

    const { projectId } = await req.json();

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

    // Fetch project details
    let projectDataStr = "";
    if (projectId) {
      const { data: project } = await supabase.from('projects').select('*, clients(name)').eq('id', projectId).single();
      if (!project) return new Response(JSON.stringify({ error: 'Proje bulunamadı.' }), { status: 404 });
      
      const { data: tasks } = await supabase.from('tasks').select('status').eq('project_id', projectId);
      
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const totalTasks = tasks?.length || 0;

      projectDataStr = `Proje Adı: ${project.name}
Müşteri: ${project.clients?.name || 'Bilinmiyor'}
Durum: ${project.status}
Bütçe: ${project.budget_amount || 0} ${project.currency}
İlerleme: %${project.progress}
Başlangıç: ${project.start_date || 'Bilinmiyor'}
Bitiş (Deadline): ${project.due_date || 'Bilinmiyor'}
Görevler: ${totalTasks} adet (${completedTasks} tamamlandı)`;
    } else {
      // Analyze all active projects
      const { data: projects } = await supabase.from('projects').select('name, status, due_date, progress').eq('user_id', user.id).eq('status', 'active');
      if (!projects || projects.length === 0) return new Response(JSON.stringify({ error: 'Aktif proje bulunamadı.' }), { status: 404 });
      
      projectDataStr = `Aktif Projeler:\n${projects.map(p => `- ${p.name} | İlerleme: %${p.progress} | Deadline: ${p.due_date || 'Yok'}`).join('\n')}`;
    }

    const { text } = await generateText({
      model,
      system: `Sen bir Proje Yönetim Uzmanısın. Verilen proje bilgilerini analiz ederek kısa, net ve aksiyon odaklı bir "Risk ve Durum Raporu" oluşturmalısın. Türkçe yanıt ver.`,
      prompt: `Lütfen aşağıdaki proje verilerine göre riskleri ve önerilerini belirt:\n\n${projectDataStr}`,
    });

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("AI Project Risk Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
