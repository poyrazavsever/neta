import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, apiKey, userMessageContent } = body;

    let assistantReply = "";

    if (provider === "groq") {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content:
                  "Sen MindSpace adlı kullanıcının kişisel yapay zeka terapistisin ve sırdaşısın. Şefkatli, yargılamayan ve destekleyici cevaplar ver. Yüzeysel öğütlerden kaçın.",
              },
              { role: "user", content: userMessageContent },
            ],
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Groq API Hatası");
      }
      const data = await res.json();
      assistantReply = data.choices[0].message.content;
    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "Sen MindSpace adlı kullanıcının kişisel yapay zeka terapistisin ve sırdaşısın. Şefkatli ve destekleyici cevap ver.",
            },
            { role: "user", content: userMessageContent },
          ],
        }),
      });
      if (!res.ok) throw new Error("OpenAI API Hatası");
      const data = await res.json();
      assistantReply = data.choices[0].message.content;
    } else {
      // Varsayılan: Yerel Ollama
      const res = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3", // veya mistral
          prompt: `Sen MindSpace adlı kullanıcının kişisel yapay zeka terapistisin ve sırdaşısın. Şefkatli ve destekleyici cevap ver.\n\nKullanıcı: ${userMessageContent}\nTerapist:`,
          stream: false,
        }),
      });

      if (!res.ok) throw new Error("Ollama API yanıt vermedi.");
      const data = await res.json();
      assistantReply = data.response;
    }

    return NextResponse.json({ reply: assistantReply });
  } catch (error: any) {
    console.error("API Route Hatası:", error);
    return NextResponse.json(
      { error: error.message || "Bilinmeyen Sunucu Hatası" },
      { status: 500 },
    );
  }
}
