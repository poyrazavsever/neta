"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mesajları eski tarihten yeniye göre sıralayarak al (Sohbet akışı)
  const messages = useLiveQuery(
    () => db.chat_messages.orderBy("created_at").toArray(),
    [],
  );

  // Ollama'ya veya harici API'ye mesaj gönder
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessageContent = input.trim();
    setInput("");
    setIsLoading(true);

    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content: userMessageContent,
      created_at: new Date().toISOString(),
    };

    try {
      await db.chat_messages.add(userMessage);

      // LocalStorage'dan veya Environment ayarlarını okuyup backend API'ye gönderiyoruz
      const provider = localStorage.getItem("mindspace_ai_provider") || "groq";
      const apiKey =
        localStorage.getItem("mindspace_api_key") ||
        process.env.NEXT_PUBLIC_GROQ_API_KEY ||
        "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          userMessageContent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Sunucu hatası oluştu.");
      }

      const data = await res.json();

      const assistantMessage = {
        id: uuidv4(),
        role: "assistant" as const,
        content:
          data.reply ||
          "Şu an cevap veremiyorum, lütfen ayarlarınızı kontrol edin.",
        created_at: new Date().toISOString(),
      };

      await db.chat_messages.add(assistantMessage);
    } catch (error) {
      console.error(error);
      await db.chat_messages.add({
        id: uuidv4(),
        role: "assistant" as const,
        content:
          "API Bağlantısı kurulamadı. Lütfen internetini veya Ayarlar sayfasından API anahtarını kontrol et.",
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    await db.chat_messages.clear();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            AI Terapist (Sohbet)
          </h1>
          <p className="text-sm text-muted-foreground">
            Ollama veya bulut destekli akıllı asistanınızla konuşun.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleClearChat}
          title="Sohbeti Temizle"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-xl border border-border bg-card shadow-sm mb-4">
        {(!messages || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="w-12 h-12 mb-2 opacity-50" />
            <p>Sohbet henüz başlamadı. İlk mesajınızı yollayın!</p>
          </div>
        )}

        {messages?.map((m) => (
          <div
            key={m.id}
            className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-2 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              >
                {m.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-3 rounded-xl ${m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none border border-border"}`}
              >
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-xl bg-muted text-foreground rounded-tl-none border border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 items-center">
        <Input
          disabled={isLoading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bugün nasıl hissediyorsun? Ya da eski günlüklere dayanarak bir şeyler sor..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
