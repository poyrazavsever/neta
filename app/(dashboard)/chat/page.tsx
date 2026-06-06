"use client";

import { useEffect, useState, useRef } from "react";
import { Brain, Send, MessageSquare, Plus, Trash2, Loader2, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "poyraz-ui/atoms";
import { useChat } from "@ai-sdk/react";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export default function AIChatPage() {
  const [supabase] = useState(() => createClient());
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, setInput, handleInputChange, handleSubmit, append, setMessages, isLoading, stop } = useChat({
    api: "/api/chat",
    body: {
      sessionId: activeSessionId
    },
    onError: (err) => {
      console.error(err);
    }
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch Sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (data) {
        setSessions(data);
        if (data.length > 0) {
          setActiveSessionId(data[0].id);
        }
      }
    };
    fetchSessions();
  }, [supabase]);

  // 2. Fetch Messages when session changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: true });

      if (data) {
        // Map Supabase messages to AI SDK format
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    };
    
    fetchMessages();
  }, [activeSessionId, supabase, setMessages]);

  const handleNewChat = async () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("chat_sessions").delete().eq("id", id);
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    if (activeSessionId === id) {
      setActiveSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
      if (updatedSessions.length === 0) setMessages([]);
    }
  };

  const customHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(input || "").trim() || isLoading) return;

    let sessionId = activeSessionId;
    const currentInput = input || "";
    setInput("");

    if (!sessionId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newSess } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: currentInput.slice(0, 30) + "..." })
        .select()
        .single();
      
      if (newSess) {
        sessionId = newSess.id;
        setActiveSessionId(sessionId);
        setSessions([newSess, ...sessions]);
      } else {
        return;
      }
    }

    // Append using AI SDK with explicit body to ensure sessionId is passed immediately
    append({ role: 'user', content: currentInput }, { body: { sessionId } });
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] w-full overflow-hidden border border-border rounded-lg bg-background">
      
      {/* Sidebar - Sessions List */}
      <div className="w-80 border-r border-border bg-muted/20 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Geçmiş Sohbetler
          </h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground mt-10">Henüz sohbet yok.</div>
          ) : (
            sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${activeSessionId === session.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground'}`}
              >
                <div className="truncate text-sm font-medium w-full pr-2">
                  {session.title || "İsimsiz Sohbet"}
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {/* Chat Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Ajan Asistan</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Sisteme görev ve veri ekleyebilir
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70 max-w-md mx-auto">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Ajan Asistan'a Hoşgeldiniz</h3>
              <p className="text-sm text-muted-foreground mb-4">Sadece sorularınızı cevaplamakla kalmaz, komutlarınızla projeler, görevler ve finans kayıtları da oluşturabilir.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
                <Button variant="outline" className="h-auto py-3 justify-start text-left text-xs whitespace-normal" onClick={() => setInput("Bana 'Sunum hazırlığı' adında yeni bir görev ekler misin?")}>
                  Görev Ekle
                </Button>
                <Button variant="outline" className="h-auto py-3 justify-start text-left text-xs whitespace-normal" onClick={() => setInput("Bugün 350 TL Yemek harcaması yaptım, kaydeder misin?")}>
                  Harcama Ekle
                </Button>
                <Button variant="outline" className="h-auto py-3 justify-start text-left text-xs whitespace-normal" onClick={() => setInput("Aktif projelerimin durumunu özetler misin?")}>
                  Projelerimi Sorgula
                </Button>
                <Button variant="outline" className="h-auto py-3 justify-start text-left text-xs whitespace-normal" onClick={() => setInput("Son 30 günlük finansal özetimi ver.")}>
                  Gelir/Gider Özeti
                </Button>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-foreground'}`}>
                    {msg.role === 'user' ? <span className="text-xs font-bold">ME</span> : <Brain className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {msg.content && (
                      <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted/50 border border-border text-foreground rounded-tl-none whitespace-pre-wrap'}`}>
                        {msg.content}
                      </div>
                    )}

                    {/* Render Tool Invocations for AI Messages */}
                    {msg.toolInvocations && msg.toolInvocations.map((tool) => (
                      <div key={tool.toolCallId} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 border border-border px-3 py-1.5 rounded-md self-start">
                        {tool.state === 'result' ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span><span className="font-medium text-foreground">{tool.toolName}</span> aracı başarıyla çalıştırıldı.</span>
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                            <span><span className="font-medium text-foreground">{tool.toolName}</span> aracı çalıştırılıyor...</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex justify-start">
             <div className="flex gap-3 max-w-[85%] flex-row">
               <div className="shrink-0 h-8 w-8 rounded-full bg-muted border border-border text-foreground flex items-center justify-center">
                 <Brain className="h-4 w-4" />
               </div>
               <div className="px-4 py-3 rounded-2xl text-sm bg-muted/50 border border-border text-foreground rounded-tl-none flex items-center gap-2">
                 <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
             </div>
           </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background">
          <form onSubmit={customHandleSubmit} className="relative flex items-end gap-2 max-w-4xl mx-auto">
            <div className="relative flex-1 bg-muted/30 border border-border rounded-xl flex items-center focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    customHandleSubmit(e);
                  }
                }}
                placeholder="Verilerinize dayalı bir soru sorun veya görev/finans kaydı eklemesini isteyin..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-4 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground min-h-[56px] max-h-[200px]"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                {isLoading ? (
                  <Button 
                    type="button" 
                    variant="outline"
                    size="icon" 
                    className="h-10 w-10 rounded-lg bg-background text-foreground"
                    onClick={() => stop()}
                  >
                    <div className="w-3 h-3 bg-current" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    size="icon" 
                    className={`h-10 w-10 rounded-lg ${(input || "").trim() ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
                    disabled={!(input || "").trim()}
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </Button>
                )}
              </div>
            </div>
          </form>
          <div className="text-center mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>Yapay Zeka Hatalar Yapabilir.</span>
            <div className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              <span>Veri okuma/yazma yetkisi aktiftir.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
