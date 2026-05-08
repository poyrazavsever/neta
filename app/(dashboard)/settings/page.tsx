"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, KeyRound, Save, User } from "lucide-react";

import { updatePassword, updateProfile } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AiProvider = "groq" | "ollama" | "openai";

function getInitialAiProvider(): AiProvider {
  if (typeof window === "undefined") {
    return "groq";
  }

  const savedProvider = localStorage.getItem("mindspace_ai_provider");
  return savedProvider === "ollama" || savedProvider === "openai"
    ? savedProvider
    : "groq";
}

function getInitialApiKey() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("mindspace_api_key") ?? "";
}

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState<AiProvider>(getInitialAiProvider);
  const [apiKey, setApiKey] = useState(getInitialApiKey);
  const [saveStatus, setSaveStatus] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileSaveStatus, setProfileSaveStatus] = useState("");
  const [passwordSaveStatus, setPasswordSaveStatus] = useState("");

  const [supabase] = useState(() => createClient());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isActive) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!data || !isActive) {
        return;
      }

      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setAvatarUrl(data.avatar_url || "");
    };

    void fetchProfile();

    return () => {
      isActive = false;
    };
  }, [supabase]);

  const handleSaveAI = () => {
    localStorage.setItem("mindspace_ai_provider", aiProvider);
    localStorage.setItem("mindspace_api_key", apiKey);

    setSaveStatus("Ayarlar başarıyla kaydedildi!");
    window.setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleProfileAction = async (formData: FormData) => {
    const response = await updateProfile(formData);

    if (response?.error) {
      setProfileSaveStatus(`Hata: ${response.error}`);
    } else {
      setProfileSaveStatus("Profil başarıyla güncellendi!");
      const avatar = formData.get("avatar");
      if (avatar instanceof File && avatar.size > 0) {
        window.location.reload();
      }
    }

    window.setTimeout(() => setProfileSaveStatus(""), 3000);
  };

  const handlePasswordAction = async (formData: FormData) => {
    const response = await updatePassword(formData);

    if (response?.error) {
      setPasswordSaveStatus(`Hata: ${response.error}`);
    } else {
      setPasswordSaveStatus("Şifre başarıyla güncellendi!");
      formRef.current?.reset();
    }

    window.setTimeout(() => setPasswordSaveStatus(""), 3000);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ayarlar</h1>
        <p className="mt-1 text-muted-foreground">
          Kullanıcı profili ve yapay zeka asistanı yapılandırmanızı yönetin.
        </p>
      </div>

      <div className="flex flex-col space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Kullanıcı Profili</h2>
        </div>

        <form action={handleProfileAction} className="space-y-4">
          <div className="mb-6 flex items-center gap-4">
            {avatarUrl ? (
              <>
                {/* Avatar URL dış kaynaklı olduğu için bu önizlemede native img kullanıyoruz. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full border border-border object-cover"
                />
              </>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 space-y-1">
              <Label htmlFor="avatar">Profil Fotoğrafı Yükle</Label>
              <Input id="avatar" name="avatar" type="file" accept="image/*" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad</Label>
              <Input
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad</Label>
              <Input
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Button type="submit" className="w-max">
              <Save className="mr-2 h-4 w-4" />
              Profili Kaydet
            </Button>
            {profileSaveStatus && (
              <span
                className={`text-sm ${
                  profileSaveStatus.startsWith("Hata")
                    ? "text-red-500"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {profileSaveStatus}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="flex flex-col space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <KeyRound className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Şifre Değiştir</h2>
        </div>

        <form ref={formRef} action={handlePasswordAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Yeni Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={6}
              placeholder="En az 6 karakter"
              required
            />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Button type="submit" className="w-max">
              <Save className="mr-2 h-4 w-4" />
              Şifreyi Güncelle
            </Button>
            {passwordSaveStatus && (
              <span
                className={`text-sm ${
                  passwordSaveStatus.startsWith("Hata")
                    ? "text-red-500"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {passwordSaveStatus}
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="flex flex-col space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/50 pb-4">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Terapist (AI) Ayarları</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>AI Sağlayıcısı</Label>
            <Select
              value={aiProvider}
              onValueChange={(value) => setAiProvider(value as AiProvider)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sağlayıcı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ollama">
                  Ollama (Yerel ve Gizlilik Odaklı)
                </SelectItem>
                <SelectItem value="openai">OpenAI (GPT-4o vb.)</SelectItem>
                <SelectItem value="groq">Groq (Llama 3 Bulut)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Gizliliğiniz için yerel Ollama önerilir. Sunucunuzda çalışmayan
              durumlarda OpenAI veya Groq gibi bulut çözümlerine
              geçebilirsiniz.
            </p>
          </div>

          {aiProvider !== "ollama" && (
            <div className="space-y-2">
              <Label>API Anahtarı ({aiProvider.toUpperCase()})</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Anahtarınız sadece tarayıcınızın kendi local hafızasında saklanır;
                herhangi bir sunucuya kaydedilmez.
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <Button type="button" onClick={handleSaveAI} className="w-max">
              <Save className="mr-2 h-4 w-4" />
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
