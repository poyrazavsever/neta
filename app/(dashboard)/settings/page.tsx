"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Bot, Save, User, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, updatePassword } from "./actions";

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState("groq"); 
  const [apiKey, setApiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileSaveStatus, setProfileSaveStatus] = useState("");
  const [passwordSaveStatus, setPasswordSaveStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const savedProvider = localStorage.getItem("mindspace_ai_provider");
    const savedApiKey = localStorage.getItem("mindspace_api_key");
    if (savedProvider) setAiProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
    
    // Fetch user profile
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setAvatarUrl(data.avatar_url || "");
        }
      }
    }
    fetchProfile();
  }, []);

  const handleSaveAI = () => {
    localStorage.setItem("mindspace_ai_provider", aiProvider);
    localStorage.setItem("mindspace_api_key", apiKey);

    setSaveStatus("Ayarlar başarıyla kaydedildi!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleProfileAction = async (formData: FormData) => {
    const res = await updateProfile(formData);
    if (res?.error) {
      setProfileSaveStatus("Hata: " + res.error);
    } else {
      setProfileSaveStatus("Profil başarıyla güncellendi!");
      if (formData.get("avatar") && (formData.get("avatar") as File).size > 0) {
        window.location.reload();
      }
    }
    setTimeout(() => setProfileSaveStatus(""), 3000);
  };

  const handlePasswordAction = async (formData: FormData) => {
    const res = await updatePassword(formData);
    if (res?.error) {
      setPasswordSaveStatus("Hata: " + res.error);
    } else {
      setPasswordSaveStatus("Şifre başarıyla güncellendi!");
      formRef.current?.reset();
    }
    setTimeout(() => setPasswordSaveStatus(""), 3000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">
          Kullanıcı profili ve yapay zeka asistanı yapılandırmanızı yönetin.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 flex flex-col">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <User className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Kullanıcı Profili</h2>
        </div>
        
        <form action={handleProfileAction} className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-border" />
            ) : (
               <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border">
                 <User className="w-8 h-8 text-muted-foreground" />
               </div>
            )}
            <div className="space-y-1 flex-1">
              <Label htmlFor="avatar">Profil Fotoğrafı Yükle</Label>
              <Input id="avatar" name="avatar" type="file" accept="image/*" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad</Label>
              <Input id="firstName" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad</Label>
              <Input id="lastName" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Button type="submit" className="w-max">
              <Save className="w-4 h-4 mr-2" />
              Profili Kaydet
            </Button>
            {profileSaveStatus && (
              <span className={`text-sm ${profileSaveStatus.startsWith("Hata") ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                {profileSaveStatus}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 flex flex-col">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <KeyRound className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
        </div>
        
        <form ref={formRef} action={handlePasswordAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Yeni Şifre</Label>
            <Input id="password" name="password" type="password" minLength={6} placeholder="En az 6 karakter" required />
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Button type="submit" className="w-max">
              <Save className="w-4 h-4 mr-2" />
              Şifreyi Güncelle
            </Button>
            {passwordSaveStatus && (
              <span className={`text-sm ${passwordSaveStatus.startsWith("Hata") ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                {passwordSaveStatus}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* AI Settings */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6 flex flex-col">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <Bot className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Terapist (AI) Ayarları</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>AI Sağlayıcısı</Label>
            <Select value={aiProvider} onValueChange={setAiProvider}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sağlayıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">
                  Ollama (Yerel & Gizlilik Odaklı)
                </SelectItem>
                <SelectItem value="openai">OpenAI (GPT-4o vb.)</SelectItem>
                <SelectItem value="groq">Groq (Llama-3 Bulut)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Gizliliğiniz için yerel Ollama önerilir. Sunucunuzda çalışmayan
              durumlarda OpenAI veya Groq gibi bulut çözümlerine geçebilirsiniz.
            </p>
          </div>

          {aiProvider !== "ollama" && (
            <div className="space-y-2">
              <Label>API Anahtarı ({aiProvider.toUpperCase()})</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Anahtarınız sadece tarayıcınızın kendi local hafızasında güvenle
                saklanır, hiçbir sunucuya kaydedilmez.
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4">
            <Button onClick={handleSaveAI} className="w-max">
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
            {saveStatus && (
              <span className="text-sm text-green-600 dark:text-green-400">
                {saveStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
