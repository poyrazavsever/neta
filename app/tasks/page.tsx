"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

export default function TasksPage() {
  const [title, setTitle] = useState("");

  const tasks = useLiveQuery(
    () => db.tasks.toArray() // Şimdilik hepsini çekiyoruz, sıralama yapılabilir
  );

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();

    try {
      await db.tasks.add({
        id: uuidv4(),
        title,
        status: "todo",
        ai_generated: false,
        date: now.split("T")[0],
        created_at: now,
      });
      setTitle("");
    } catch (error) {
      console.error("Görev eklenemedi:", error);
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: string) => {
    await db.tasks.update(id, {
      status: currentStatus === "todo" ? "completed" : "todo",
    });
  };

  const deleteTask = async (id: string) => {
    await db.tasks.delete(id);
  };

  const pendingTasks = tasks?.filter(t => t.status === "todo") || [];
  const completedTasks = tasks?.filter(t => t.status === "completed") || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Görevler & Planlar</h1>
        <p className="text-muted-foreground">Kişisel hedeflerin ve YZ tarafından önerilen aksiyonlar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Görev</CardTitle>
          <CardDescription>Aklındakini aksiyona dönüştür.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input 
              placeholder="Örn: 15 dakika yürüyüş yap..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Ekle</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 pt-4">
        {/* Yapılacaklar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Yapılacaklar <span className="text-sm px-2 py-0.5 rounded-full bg-primary/20 text-primary">{pendingTasks.length}</span>
          </h2>
          <div className="space-y-2">
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bekleyen görev yok.</p>
            ) : (
              pendingTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-sm group transition-all hover:border-primary/50">
                  <Checkbox 
                    checked={false} 
                    onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                    className="w-5 h-5"
                  />
                  <span className="flex-1 text-sm font-medium">{task.title}</span>
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all rounded-md hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tamamlananlar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold opacity-70 flex items-center gap-2">
            Tamamlananlar <span className="text-sm px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{completedTasks.length}</span>
          </h2>
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Hiç görev tamamlanmadı.</p>
            ) : (
              completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40 shadow-sm group">
                  <Checkbox 
                    checked={true} 
                    onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                    className="w-5 h-5 data-[state=checked]:bg-muted-foreground data-[state=checked]:border-muted-foreground"
                  />
                  <span className="flex-1 text-sm line-through text-muted-foreground">{task.title}</span>
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-500 transition-all rounded-md hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
