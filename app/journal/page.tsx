"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { analyzeJournalWithLocalAI } from "@/lib/ai";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const moods = [
  { id: "happy", label: "Mutlu", emoji: "😊" },
  { id: "neutral", label: "Nötr", emoji: "😐" },
  { id: "sad", label: "Üzgün", emoji: "😔" },
  { id: "angry", label: "Sinirli", emoji: "😠" },
];

export default function JournalPage() {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("happy");
  const [energy, setEnergy] = useState("3");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dexie.js üzerinden günlükleri tarih sırasına göre çekiyoruz (en yeni en üstte)
  const journals = useLiveQuery(
    () => db.journals.orderBy("date").reverse().toArray()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const entryId = uuidv4();
    const currentContent = content; // Analiz için metni kopyala

    try {
      // 1. Veriyi veritabanına hemen ekle (Kullanıcı beklemesin)
      await db.journals.add({
        id: entryId,
        date: now.split("T")[0],
        mood,
        energy: parseInt(energy, 10),
        content: currentContent,
        created_at: now,
        updated_at: now,
      });

      // UI'ı Sıfırla
      setContent("");
      setEnergy("3");
      setMood("happy");

      // 2. Arka planda AI Analizi başlat
      try {
        const aiResult = await analyzeJournalWithLocalAI(currentContent);
        if (aiResult) {
          await db.journals.update(entryId, {
            ai_tags: aiResult.ai_tags,
            ai_sentiment_score: aiResult.ai_sentiment_score,
            ai_summary: aiResult.ai_summary,
          });

          // Eğer AI görev önerdiyse Görevler tablosuna at (pending / onay bekliyor yapısı eklenebilir ama direkt atalım)
          if (aiResult.suggested_tasks && aiResult.suggested_tasks.length > 0) {
            for (const taskTitle of aiResult.suggested_tasks) {
              await db.tasks.add({
                id: uuidv4(),
                journal_id: entryId,
                title: `AI Önerisi: ${taskTitle}`,
                status: "todo",
                ai_generated: true,
                date: now.split("T")[0],
                created_at: now,
              });
            }
          }
        }
      } catch (aiErr) {
        console.error("Arka plan AI analizi hatası:", aiErr);
      }

    } catch (error) {
      console.error("Günlük kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Bu günlüğü silmek istediğinden emin misin?")) {
      await db.journals.delete(id);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Günlük</h1>
        <p className="text-muted-foreground">Zihnini boşalt, hislerini kaydet. Verilerin sadece cihazında kalır.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Kayıt</CardTitle>
          <CardDescription>Bugün nasıl hissediyorsun?</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ruh Hali</Label>
                <div className="flex gap-2">
                  {moods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`flex-1 py-2 px-1 rounded-md border text-xl flex items-center justify-center transition-colors ${
                        mood === m.id ? "bg-primary/20 border-primary" : "bg-card border-border hover:bg-muted"
                      }`}
                      title={m.label}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Enerji Seviyesi (1-5): {energy}</Label>
                <Input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Düşüncelerini buraya dök...</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-y"
                placeholder="Örneğin: Bugün toplantıda işler ters gitti..."
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold">Geçmiş Kayıtlar</h2>
        {!journals ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : journals.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz kayıt bulunmuyor.</p>
        ) : (
          <div className="grid gap-4">
            {journals.map((journal) => (
              <Card key={journal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span>{moods.find(m => m.id === journal.mood)?.emoji}</span>
                      <span>{journal.date}</span>
                    </CardTitle>
                    <span className="text-xs px-2 py-1 bg-muted rounded-md font-medium text-muted-foreground">
                      Enerji: {journal.energy}/5
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{journal.content}</p>
                  
                  {/* AI Sonuçlarını Göster */}
                  {journal.ai_tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {journal.ai_tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {journal.ai_summary && (
                    <div className="mt-3 p-3 bg-muted/40 rounded-lg border text-sm text-muted-foreground italic border-l-2 border-l-primary">
                      " {journal.ai_summary} "
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(journal.id)}>Sil</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
