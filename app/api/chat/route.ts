import { NextResponse } from "next/server";

type ChatProvider = "groq" | "openai" | "ollama";

type ChatRequestBody = {
  provider?: ChatProvider;
  apiKey?: string;
  userMessageContent?: string;
};

type ProviderErrorResponse = {
  error?: {
    message?: string;
  };
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type OllamaResponse = {
  response?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const provider = body.provider ?? "ollama";
    const apiKey = body.apiKey ?? "";
    const userMessageContent = body.userMessageContent?.trim();

    if (!userMessageContent) {
      return NextResponse.json(
        { error: "Mesaj içeriği boş olamaz." },
        { status: 400 },
      );
    }

    let assistantReply = "";

    if (provider === "groq") {
      const response = await fetch(
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

      if (!response.ok) {
        const errorData = (await response.json()) as ProviderErrorResponse;
        throw new Error(errorData.error?.message || "Groq API hatası");
      }

      const data = (await response.json()) as ChatCompletionResponse;
      assistantReply = data.choices?.[0]?.message?.content ?? "";
    } else if (provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

      if (!response.ok) {
        throw new Error("OpenAI API hatası");
      }

      const data = (await response.json()) as ChatCompletionResponse;
      assistantReply = data.choices?.[0]?.message?.content ?? "";
    } else {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3",
          prompt: `Sen MindSpace adlı kullanıcının kişisel yapay zeka terapistisin ve sırdaşısın. Şefkatli ve destekleyici cevap ver.\n\nKullanıcı: ${userMessageContent}\nTerapist:`,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Ollama API yanıt vermedi.");
      }

      const data = (await response.json()) as OllamaResponse;
      assistantReply = data.response ?? "";
    }

    if (!assistantReply) {
      throw new Error("Model geçerli bir yanıt üretmedi.");
    }

    return NextResponse.json({ reply: assistantReply });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("API route hatası:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
