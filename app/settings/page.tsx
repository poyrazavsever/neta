"use client";

import { useState, useEffect } from "react";
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
import { Bot, Save } from "lucide-react";

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState("groq"); // Varsayılan olarak Groq yapalım
  const [apiKey, setApiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Sayfa yüklendiğinde LocalStorage'dan ayarları çek
  useEffect(() => {
    const savedProvider = localStorage.getItem("mindspace_ai_provider");
    const savedApiKey = localStorage.getItem("mindspace_api_key");
    if (savedProvider) setAiProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem("mindspace_ai_provider", aiProvider);
    localStorage.setItem("mindspace_api_key", apiKey);

    setSaveStatus("Ayarlar başarıyla kaydedildi!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">
          Yapay zeka asistanı ve uygulama yapılandırmanızı yönetin.
        </p>
      </div>

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
            <Button onClick={handleSave} className="w-max">
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
