"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, PenTool, CheckCircle } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

const moodScores: Record<string, number> = { happy: 4, neutral: 3, sad: 2, angry: 1 };

export default function DashboardPage() {
  const journals = useLiveQuery(() => db.journals.orderBy("date").toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  
  const pendingTasksCount = tasks.filter(t => t.status === "todo").length;
  
  // Bugüne ait enerji seviyesi
  const today = new Date().toISOString().split("T")[0];
  const todaysJournal = journals.find(j => j.date === today);
  const todaysEnergy = todaysJournal ? todaysJournal.energy : "--";

  // 1. Grafik: Son 7 günün Ruh Hali ve Enerji trendi
  const trendData = useMemo(() => {
    const dataMap: Record<string, { date: string, moodSum: number, energySum: number, count: number }> = {};
    
    journals.forEach(j => {
      if (!dataMap[j.date]) {
        dataMap[j.date] = { date: j.date, moodSum: 0, energySum: 0, count: 0 };
      }
      dataMap[j.date].moodSum += moodScores[j.mood] || 3;
      dataMap[j.date].energySum += j.energy;
      dataMap[j.date].count += 1;
    });

    return Object.values(dataMap)
      .map(d => ({
        date: d.date.slice(5), // Sadece MM-DD formatı alalım
        Mood: Number((d.moodSum / d.count).toFixed(1)),
        Enerji: Number((d.energySum / d.count).toFixed(1)),
      }))
      .slice(-7); // Sadece son 7 günü göster
  }, [journals]);

  // 2. Grafik: En çok kullanılan AI etiketleri
  const tagData = useMemo(() => {
    const counts: Record<string, number> = {};
    journals.forEach(j => {
      if (j.ai_tags) {
        j.ai_tags.forEach(tag => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, Değer: value }))
      .sort((a, b) => b.Değer - a.Değer)
      .slice(0, 5); // En çok geçen 5 etiket
  }, [journals]);

  // Son günlüğe ait AI Summary
  const lastInsight = [...journals].reverse().find(j => j.ai_summary)?.ai_summary;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bugün Nasılsın?</h1>
        <p className="text-muted-foreground">Kişisel özetin ve yapay zeka analizlerin burada görünecek.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Günlük Kayıtları</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {journals.length === 0 ? "Henüz kayıt girilmedi" : "Toplam kayıt eklendi"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bekleyen görev
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Bugünkü Enerji</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysEnergy}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todaysJournal ? "/ 5 Seviyesinde" : "Kayıt bekleniyor"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Local AI Durumu</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Hazır</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ollama / Veri bekliyor
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 ">
        {/* Line Chart */}
        <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">Ruh Hali & Enerji Trendi</h3>
            <p className="text-sm text-muted-foreground">Son 7 günlük ortalamalar (1-5 Arası Puanlama)</p>
          </div>
          <div className="h-[250px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={30} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", backgroundColor: "#fff", color: "#000", border: "none" }}
                    itemStyle={{ fontWeight: "500" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "14px" }} />
                  <Line type="monotone" dataKey="Mood" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Enerji" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed rounded-md bg-muted/20">
                <p className="text-sm text-muted-foreground">Veri bekleniyor...</p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Bar Chart & Insight */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <Card className="p-6 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-1">AI Konu Dağılımı</h3>
              <p className="text-sm text-muted-foreground">Günlüklerinden çıkarılan en sık 5 etiket</p>
            </div>
            <div className="h-[150px] w-full mt-auto">
              {tagData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagData} layout="vertical" margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888833" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13 }} width={90} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: "8px", backgroundColor: "#fff", color: "#000", border: "none" }}
                    />
                    <Bar dataKey="Değer" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground">Yeterli etiket yok.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20 flex-1">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> Son AI İçgörüsü
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              {lastInsight ? `"${lastInsight}"` : "Henüz bir içgörü oluşmadı. Biraz günlük yaz, AI analiz yapsın."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
