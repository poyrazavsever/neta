"use client";

import { useEffect, useRef, useState } from "react";
import { User, Bell, Shield, Blocks, Brain, CreditCard, Save, Key, AlertTriangle } from "lucide-react";
import { updatePassword, updateProfile } from "./actions";
import { createClient } from "@/lib/supabase/client";

type AiProvider = "groq" | "ollama" | "openai" | "gemini";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("AI Preferences");

  // Profile States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileSaveStatus, setProfileSaveStatus] = useState("");
  
  // Security States
  const [passwordSaveStatus, setPasswordSaveStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // AI States
  const [aiProvider, setAiProvider] = useState<AiProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [aiSaveStatus, setAiSaveStatus] = useState("");
  
  // Supabase
  const [supabase] = useState(() => createClient());

  const tabs = [
    { name: "Profile & Account", icon: User },
    { name: "AI Preferences", icon: Brain },
    { name: "Security", icon: Shield },
    { name: "Integrations", icon: Blocks },
    { name: "Notifications", icon: Bell },
    { name: "Billing & Plans", icon: CreditCard },
  ];

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isActive) return;

      // 1. Fetch Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile && isActive) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setAvatarUrl(profile.avatar_url || "");
      }

      // 2. Fetch User Settings from Supabase
      const { data: settings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (settings && isActive) {
        setAiProvider((settings.ai_model as AiProvider) || "gemini");
        setApiKey(settings.api_key || "");
        
        // Also sync to local storage for existing API route calls if they use it
        localStorage.setItem("mindspace_ai_provider", settings.ai_model);
        localStorage.setItem("mindspace_api_key", settings.api_key || "");
      }
    };

    void fetchData();
    return () => { isActive = false; };
  }, [supabase]);

  const handleProfileAction = async (formData: FormData) => {
    const response = await updateProfile(formData);
    if (response?.error) {
      setProfileSaveStatus(`Hata: ${response.error}`);
    } else {
      setProfileSaveStatus("Profil güncellendi!");
      const avatar = formData.get("avatar");
      if (avatar instanceof File && avatar.size > 0) window.location.reload();
    }
    setTimeout(() => setProfileSaveStatus(""), 3000);
  };

  const handlePasswordAction = async (formData: FormData) => {
    const response = await updatePassword(formData);
    if (response?.error) {
      setPasswordSaveStatus(`Hata: ${response.error}`);
    } else {
      setPasswordSaveStatus("Şifre güncellendi!");
      formRef.current?.reset();
    }
    setTimeout(() => setPasswordSaveStatus(""), 3000);
  };

  const handleSaveAI = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Giriş yapılmamış");

      // Save to Supabase user_settings table
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          ai_model: aiProvider,
          api_key: apiKey,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Sync to localStorage as a redundant fallback
      localStorage.setItem("mindspace_ai_provider", aiProvider);
      localStorage.setItem("mindspace_api_key", apiKey);

      setAiSaveStatus("Yapay Zeka ayarları kaydedildi!");
    } catch (e: any) {
      console.error(e);
      setAiSaveStatus("Hata oluştu, veritabanına kaydedilemedi.");
    }
    setTimeout(() => setAiSaveStatus(""), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-80px)] flex flex-col text-foreground font-sans space-y-6">
      
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Settings</span> / {activeTab}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors text-left ${
                  activeTab === tab.name 
                    ? "bg-[#1F172B] text-primary border border-primary/20 shadow-inner" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === tab.name ? "text-primary" : "text-muted-foreground"}`} />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 rounded-sm border border-white/5 bg-[#0A0710] p-8 overflow-y-auto tiny-scrollbar">
          
          {activeTab === "Profile & Account" && (
            <div className="max-w-2xl animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-6">User Profile</h2>
              <form action={handleProfileAction} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full border border-white/10 object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#150F1D]">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium">Profil Fotoğrafı</label>
                    <input id="avatar" name="avatar" type="file" accept="image/*" className="block w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ad</label>
                    <input name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Soyad</label>
                    <input name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors" />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6">
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
                    <Save className="h-4 w-4" /> Profili Kaydet
                  </button>
                  {profileSaveStatus && <span className="text-sm text-emerald-400">{profileSaveStatus}</span>}
                </div>
              </form>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="max-w-2xl animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-6">Şifre İşlemleri</h2>
              <form ref={formRef} action={handlePasswordAction} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Yeni Şifre</label>
                  <input name="password" type="password" minLength={6} placeholder="En az 6 karakter" required className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div className="flex items-center gap-4">
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
                    <Save className="h-4 w-4" /> Şifreyi Güncelle
                  </button>
                  {passwordSaveStatus && <span className="text-sm text-emerald-400">{passwordSaveStatus}</span>}
                </div>
              </form>
            </div>
          )}

          {activeTab === "AI Preferences" && (
            <div className="max-w-2xl animate-in fade-in duration-300">
              <h2 className="text-xl font-bold mb-6">AI Assistant Configuration</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold mb-3 border-b border-white/5 pb-2">Model ve Sağlayıcı Seçimi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <label onClick={() => setAiProvider("gemini")} className={`flex flex-col p-4 rounded-sm cursor-pointer relative overflow-hidden transition-colors ${aiProvider === "gemini" ? "border border-primary bg-primary/10" : "border border-white/10 bg-[#150F1D] opacity-60 hover:opacity-100"}`}>
                      {aiProvider === "gemini" && <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 rounded-full bg-primary"></div></div>}
                      <span className="font-bold text-sm mb-1">Google Gemini</span>
                      <span className="text-[11px] text-muted-foreground leading-tight">Gelişmiş akıl yürütme. (Varsayılan)</span>
                    </label>
                    <label onClick={() => setAiProvider("openai")} className={`flex flex-col p-4 rounded-sm cursor-pointer relative overflow-hidden transition-colors ${aiProvider === "openai" ? "border border-primary bg-primary/10" : "border border-white/10 bg-[#150F1D] opacity-60 hover:opacity-100"}`}>
                      {aiProvider === "openai" && <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 rounded-full bg-primary"></div></div>}
                      <span className="font-bold text-sm mb-1">OpenAI (GPT)</span>
                      <span className="text-[11px] text-muted-foreground leading-tight">GPT-4o veya GPT-4.</span>
                    </label>
                    <label onClick={() => setAiProvider("groq")} className={`flex flex-col p-4 rounded-sm cursor-pointer relative overflow-hidden transition-colors ${aiProvider === "groq" ? "border border-primary bg-primary/10" : "border border-white/10 bg-[#150F1D] opacity-60 hover:opacity-100"}`}>
                      {aiProvider === "groq" && <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 rounded-full bg-primary"></div></div>}
                      <span className="font-bold text-sm mb-1">Groq (Llama 3)</span>
                      <span className="text-[11px] text-muted-foreground leading-tight">Yüksek hızlı bulut çıkarımı.</span>
                    </label>
                    <label onClick={() => setAiProvider("ollama")} className={`flex flex-col p-4 rounded-sm cursor-pointer relative overflow-hidden transition-colors ${aiProvider === "ollama" ? "border border-primary bg-primary/10" : "border border-white/10 bg-[#150F1D] opacity-60 hover:opacity-100"}`}>
                      {aiProvider === "ollama" && <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 rounded-full bg-primary"></div></div>}
                      <span className="font-bold text-sm mb-1">Ollama (Yerel)</span>
                      <span className="text-[11px] text-muted-foreground leading-tight">Gizlilik odaklı yerel modeller.</span>
                    </label>
                  </div>
                </div>

                {aiProvider !== "ollama" && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 border-b border-white/5 pb-2">API Keys</h3>
                    <div className="bg-[#150F1D] border border-white/5 rounded-sm p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{aiProvider.toUpperCase()} API Key</span>
                      </div>
                      <input 
                        type="password" 
                        value={apiKey} 
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="bg-[#0A0710] border border-white/10 rounded-sm px-3 py-2 text-sm text-foreground w-full outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <button onClick={handleSaveAI} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
                    <Save className="h-4 w-4" /> Ayarları Kaydet
                  </button>
                  {aiSaveStatus && <span className="text-sm text-emerald-400">{aiSaveStatus}</span>}
                </div>

              </div>
            </div>
          )}

          {["Integrations", "Notifications", "Billing & Plans"].includes(activeTab) && (
            <div className="max-w-2xl animate-in fade-in duration-300 flex flex-col items-center justify-center h-full opacity-50 py-20">
              <Blocks className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-bold mb-2">{activeTab}</h2>
              <p className="text-sm text-center text-muted-foreground">Bu bölüm şu an geliştirme aşamasındadır.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
