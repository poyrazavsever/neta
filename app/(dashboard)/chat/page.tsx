"use client";

import { useEffect, useState, useRef } from "react";
import { Brain, Send, Paperclip, MoreHorizontal, Search, MessageSquare, Plus, FileText, CheckCircle2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export default function AIChatPage() {
  const [supabase] = useState(() => createClient());
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (!activeSessionId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data as ChatMessage[]);
      }
    };
    fetchMessages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`chat:${activeSessionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `session_id=eq.${activeSessionId}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as ChatMessage];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId, supabase]);

  const handleNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newSession = {
      user_id: user.id,
      title: "Yeni Sohbet",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert(newSession)
      .select()
      .single();

    if (data) {
      setSessions([data, ...sessions]);
      setActiveSessionId(data.id);
      setMessages([]);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    setInput("");
    
    // Ensure we have a session
    let sessionId = activeSessionId;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!sessionId) {
      const { data: newSess } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user.id, title: userMessageContent.slice(0, 30) + "..." })
        .select()
        .single();
      if (newSess) {
        sessionId = newSess.id;
        setActiveSessionId(sessionId);
        setSessions([newSess, ...sessions]);
      } else return;
    }

    setIsLoading(true);

    // 1. Optimistic Update: Add User Message locally
    const optimisticUserMsg: ChatMessage = {
      id: uuidv4(),
      session_id: sessionId,
      role: "user",
      content: userMessageContent,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticUserMsg]);

    // 2. Save User Message to Supabase
    await supabase.from("chat_messages").insert({
      id: optimisticUserMsg.id,
      session_id: sessionId,
      role: "user",
      content: userMessageContent
    });

    try {
      // 3. Fetch AI preferences for API call
      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const provider = settings?.ai_model || localStorage.getItem("mindspace_ai_provider") || "gemini";
      const apiKey = settings?.api_key || localStorage.getItem("mindspace_api_key") || "";

      // 4. Call AI API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, userMessageContent }),
      });

      if (!res.ok) throw new Error("AI API Error");
      const data = await res.json();

      // 5. Optimistic Update: Add Assistant Message locally
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        role: "assistant",
        content: data.reply || "Cevap üretilemedi.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);

      // 6. Save Assistant Message to Supabase
      await supabase.from("chat_messages").insert({
        id: assistantMsg.id,
        session_id: sessionId,
        role: "assistant",
        content: assistantMsg.content
      });

      // 7. Update session title if it was default
      const currentSession = sessions.find(s => s.id === sessionId);
      if (currentSession?.title === "Yeni Sohbet") {
        const newTitle = userMessageContent.slice(0, 40);
        await supabase.from("chat_sessions").update({ title: newTitle }).eq("id", sessionId);
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle } : s));
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        session_id: sessionId,
        role: "assistant",
        content: "Hata oluştu. Lütfen Ayarlar sayfasından API anahtarınızı kontrol edin.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      await supabase.from("chat_messages").insert({
        id: errorMsg.id,
        session_id: sessionId,
        role: "assistant",
        content: errorMsg.content
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("chat_sessions").delete().eq("id", id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-80px)] flex flex-col text-foreground font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <h1 className="text-lg font-medium text-muted-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-foreground">MindSpace</span> / AI Assistant
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={handleNewChat} className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            NEW CHAT
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex gap-6 mt-6 min-h-0">
        
        {/* Left Sidebar: Chat Sessions */}
        <div className="hidden lg:flex w-72 flex-col gap-4 shrink-0 border border-white/5 bg-[#0A0710] rounded-sm overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-[#0F0B15]/50">
            <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-muted-foreground/50 text-foreground"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto tiny-scrollbar p-3 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 mb-1">Recent Conversations</div>
            {sessions.map((session) => (
              <div 
                key={session.id} 
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-colors ${activeSessionId === session.id ? 'bg-[#1F172B] border border-primary/30 text-primary' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground border border-transparent'}`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{session.title}</div>
                  <div className="text-[10px] mt-0.5 opacity-60">{new Date(session.created_at).toLocaleDateString()}</div>
                </div>
                <button onClick={(e) => deleteSession(session.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-sm transition-opacity">
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Chat Area */}
        <div className="flex-1 flex flex-col rounded-sm border border-white/5 bg-[#0A0710] overflow-hidden relative">
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto tiny-scrollbar p-6 space-y-8">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60">
                <Brain className="w-16 h-16 mb-4 text-primary opacity-50" />
                <p className="text-sm font-medium">Hello! I am your MindSpace AI Assistant.</p>
                <p className="text-xs mt-1">Start a conversation or select a session from history.</p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex items-start gap-4 max-w-4xl ${m.role === "user" ? "ml-auto" : "mr-auto"}`}>
                {m.role === "assistant" && (
                  <div className="h-8 w-8 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className={`flex-1 p-5 ${m.role === "user" ? "bg-[#150F1D] border border-white/10 rounded-sm rounded-tr-none" : "bg-[linear-gradient(135deg,rgba(108,91,176,0.05)_0%,rgba(10,7,16,0)_100%)] border border-primary/10 rounded-sm rounded-tl-none"}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 rounded-sm bg-[#1F172B] border border-white/10 flex items-center justify-center font-bold text-foreground shrink-0 text-[10px]">ME</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-primary text-xs ml-12">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                MindSpace AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          <div className="p-4 border-t border-white/5 bg-[#0F0B15]/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex flex-col bg-[#150F1D] border border-white/10 rounded-sm focus-within:border-primary/50 transition-colors p-2 shadow-2xl">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Message your MindSpace AI... (Press Enter to send)"
                className="w-full bg-transparent border-none outline-none text-sm text-foreground resize-none p-2 min-h-[60px] tiny-scrollbar disabled:opacity-50"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex gap-2">
                  <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors" title="Attach Context"><Paperclip className="h-4 w-4" /></button>
                  <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors" title="Settings"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-sm transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-3">AI can make mistakes. Verify important decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
