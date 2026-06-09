"use client";

import { createClient } from "@/lib/supabase/client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Brain, Loader2, MessageSquare, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "poyraz-ui/atoms";
import { useEffect, useRef, useState } from "react";
import { toast } from "poyraz-ui/molecules";

function formatMessageContent(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={j}>{part.slice(1, -1)}</em>;
        }
        return <span key={j}>{part}</span>;
      })}
      {i !== lines.length - 1 && <br />}
    </span>
  ));
}

type ChatSession = {
  id: string;
  title: string;
  created_at: string;
};

export default function AIChatPage() {
  const [supabase] = useState(() => createClient());
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, setMessages, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Yapay zeka ile iletişim kurulurken bir hata oluştu.");
    },
  });
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function fetchSessions() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("chat_sessions")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setSessions(data);
        setActiveSessionId(data[0]?.id || null);
      }
    }

    void fetchSessions();
  }, [supabase]);

  useEffect(() => {
    async function fetchMessages() {
      if (!activeSessionId) {
        setMessages([]);
        return;
      }

      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, content")
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: true });

      const formattedMessages: UIMessage[] = (data || []).map((message) => ({
        id: message.id,
        role: message.role as UIMessage["role"],
        parts: [{ type: "text", text: message.content || "" }],
      }));

      setMessages(formattedMessages);
    }

    void fetchMessages();
  }, [activeSessionId, setMessages, supabase]);

  async function handleNewChat() {
    setActiveSessionId(null);
    setMessages([]);
  }

  async function handleDeleteSession(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    await supabase.from("chat_sessions").delete().eq("id", id);

    const nextSessions = sessions.filter((session) => session.id !== id);
    setSessions(nextSessions);

    if (activeSessionId === id) {
      setActiveSessionId(nextSessions[0]?.id || null);
      if (nextSessions.length === 0) setMessages([]);
    }
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    const currentInput = input.trim();
    if (!currentInput || isLoading) return;

    let sessionId = activeSessionId;
    setInput("");

    if (!sessionId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: currentInput.length > 32 ? `${currentInput.slice(0, 32)}...` : currentInput,
        })
        .select("id, title, created_at")
        .single();

      if (!newSession) return;

      sessionId = newSession.id;
      setActiveSessionId(sessionId);
      setSessions((currentSessions) => [newSession, ...currentSessions]);
    }

    await sendMessage({ text: currentInput }, { body: { sessionId } });
  }

  return (
    <div className="flex h-[calc(100dvh-6rem)] w-full overflow-hidden rounded-sm border border-border bg-background">
      <aside className="hidden w-80 flex-col border-r border-border bg-muted/20 md:flex">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <MessageSquare className="h-4 w-4" />
            Sohbetler
          </h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="tiny-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
          {sessions.length === 0 ? (
            <div className="mt-10 text-center text-sm text-muted-foreground">
              Henüz sohbet yok.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex w-full items-center justify-between rounded-sm p-3 text-left transition-colors ${
                  activeSessionId === session.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="truncate pr-2 text-sm font-medium">
                  {session.title || "İsimsiz sohbet"}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => void handleDeleteSession(session.id, event)}
                  className="rounded-sm p-1 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">AI Asistan</h1>
              <p className="text-xs text-muted-foreground">Kayıtlı verilerin hakkında soru sor.</p>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 md:hidden" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </header>

        <div className="tiny-scrollbar flex-1 space-y-5 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <Brain className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Verilerine danış</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Görevler, projeler, müşteriler, finans ve günlük kayıtların hakkında soru sorabilirsin.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const text = getMessageText(message);

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-sm px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-muted/40 text-foreground"
                    }`}
                  >
                    {formatMessageContent(text)}
                  </div>
                </div>
              );
            })
          )}

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Yanıt hazırlanıyor...
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-sm border border-border bg-background p-2 focus-within:border-primary">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSubmit(event);
                }
              }}
              placeholder="Örn. Bu hafta geciken işlerim neler?"
              className="min-h-10 max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
              rows={1}
              disabled={isLoading}
            />
            {isLoading ? (
              <Button type="button" variant="outline" size="icon" onClick={() => void stop()}>
                <span className="h-3 w-3 bg-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}
