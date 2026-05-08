"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { v4 as uuidv4 } from "uuid";

import { analyzeJournalWithLocalAI } from "@/lib/ai";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Dexie.js üzerinden günlükleri tarih sırasına göre çekiyoruz (en yeni en üstte).
  const journals = useLiveQuery(() =>
    db.journals.orderBy("date").reverse().toArray(),
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const entryId = uuidv4();
    const currentContent = content;

    try {
      // Veriyi önce kaydet, AI analizini daha sonra arka planda tamamla.
      await db.journals.add({
        id: entryId,
        date: now.split("T")[0],
        mood,
        energy: parseInt(energy, 10),
        content: currentContent,
        created_at: now,
        updated_at: now,
      });

      setContent("");
      setEnergy("3");
      setMood("happy");

      try {
        const aiResult = await analyzeJournalWithLocalAI(currentContent);
        if (aiResult) {
          await db.journals.update(entryId, {
            ai_tags: aiResult.ai_tags,
            ai_sentiment_score: aiResult.ai_sentiment_score,
            ai_summary: aiResult.ai_summary,
          });

          if (aiResult.suggested_tasks?.length) {
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
      } catch (aiError) {
        console.error("Arka plan AI analizi hatası:", aiError);
      }
    } catch (error) {
      console.error("Günlük kaydedilemedi:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu günlüğü silmek istediğinden emin misin?")) {
      await db.journals.delete(id);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-in space-y-6 fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Günlük</h1>
        <p className="text-muted-foreground">
          Zihnini boşalt, hislerini kaydet. Verilerin sadece cihazında kalır.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Kayıt</CardTitle>
          <CardDescription>Bugün nasıl hissediyorsun?</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ruh Hali</Label>
                <div className="flex gap-2">
                  {moods.map((currentMood) => (
                    <button
                      key={currentMood.id}
                      type="button"
                      onClick={() => setMood(currentMood.id)}
                      className={`flex flex-1 items-center justify-center rounded-md border px-1 py-2 text-xl transition-colors ${
                        mood === currentMood.id
                          ? "border-primary bg-primary/20"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                      title={currentMood.label}
                    >
                      {currentMood.emoji}
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
                  onChange={(event) => setEnergy(event.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Düşüncelerini buraya dök...</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[150px] resize-y"
                placeholder="Örneğin: Bugün toplantıda işler ters gitti..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
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
          <p className="text-sm text-muted-foreground">
            Henüz kayıt bulunmuyor.
          </p>
        ) : (
          <div className="grid gap-4">
            {journals.map((journal) => (
              <Card key={journal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span>
                        {moods.find((currentMood) => currentMood.id === journal.mood)
                          ?.emoji ?? "📝"}
                      </span>
                      <span>{journal.date}</span>
                    </CardTitle>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      Enerji: {journal.energy}/5
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {journal.content}
                  </p>

                  {journal.ai_tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {journal.ai_tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {journal.ai_summary && (
                    <div className="mt-3 rounded-lg border border-l-2 border-l-primary bg-muted/40 p-3 text-sm italic text-muted-foreground">
                      &ldquo;{journal.ai_summary}&rdquo;
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => handleDelete(journal.id)}
                    >
                      Sil
                    </Button>
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
