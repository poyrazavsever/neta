import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Yetkisiz erişim", { status: 401 });
    }

    const body = await request.json();
    const messages = (body.messages || []) as UIMessage[];
    const sessionId = body.sessionId as string | undefined;
    const latestMessage = messages[messages.length - 1];
    const latestText = latestMessage ? getMessageText(latestMessage) : "";

    if (sessionId && latestMessage?.role === "user" && latestText) {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        role: "user",
        content: latestText,
      });
    }

    const { data: appSettings } = await supabase
      .from("app_settings")
      .select("ai_provider, ai_model, api_key")
      .eq("user_id", user.id)
      .single();

    const provider = body.provider || appSettings?.ai_provider || "openai";
    const apiKey = body.apiKey || appSettings?.api_key || "";
    const modelName = appSettings?.ai_model || getDefaultModel(provider);
    const model = getModel(provider, apiKey, modelName);
    const context = await buildUserContext(user.id);

    const result = streamText({
      model,
      system: `Sen Cognis içindeki kişisel Freelancer OS asistanısın.
Kullanıcının kayıtlı verileri hakkında kısa, net ve Türkçe cevap ver.
Veri yoksa bunu açıkça söyle. Klinik, finansal veya hukuki kesin hüküm verme.

Kullanıcının güncel veri özeti:
${context}`,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        if (sessionId && text) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: text,
          });
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(error instanceof Error ? error.message : "Internal Server Error", {
      status: 500,
    });
  }
}

function getDefaultModel(provider: string) {
  if (provider === "gemini") return "gemini-1.5-pro-latest";
  if (provider === "groq") return "llama-3.1-8b-instant";
  return "gpt-4o";
}

function getModel(provider: string, apiKey: string, modelName: string) {
  if (provider === "gemini") {
    return createGoogleGenerativeAI({ apiKey })(modelName);
  }

  if (provider === "groq") {
    return createOpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" })(modelName);
  }

  return createOpenAI({ apiKey })(modelName);
}

async function buildUserContext(userId: string) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceDate = since.toISOString().slice(0, 10);

  const [{ data: tasks }, { data: projects }, { data: finance }, { data: logs }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("title, status, priority, due_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("projects")
        .select("name, status, progress, due_date")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("finance_transactions")
        .select("type, amount, currency, category, payment_status, transaction_date")
        .eq("user_id", userId)
        .gte("transaction_date", sinceDate)
        .order("transaction_date", { ascending: false })
        .limit(20),
      supabase
        .from("daily_logs")
        .select("log_date, mood_score, energy_score, work_satisfaction_score, note")
        .eq("user_id", userId)
        .gte("log_date", sinceDate)
        .order("log_date", { ascending: false })
        .limit(14),
    ]);

  return [
    formatContextList("Görevler", tasks),
    formatContextList("Projeler", projects),
    formatContextList("Son 30 gün finans", finance),
    formatContextList("Son günlük kayıtlar", logs),
  ].join("\n\n");
}

function formatContextList(title: string, rows: unknown[] | null) {
  if (!rows || rows.length === 0) return `${title}: kayıt yok.`;

  return `${title}:\n${rows
    .map((row) => `- ${JSON.stringify(row)}`)
    .join("\n")}`;
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
