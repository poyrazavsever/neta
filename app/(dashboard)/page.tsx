"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Activity, Brain, CheckCircle, PenTool } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { db, type Journal, type Task } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EMPTY_JOURNALS: Journal[] = [];
const EMPTY_TASKS: Task[] = [];

const moodScores: Record<string, number> = {
  happy: 4,
  neutral: 3,
  sad: 2,
  angry: 1,
};

export default function DashboardPage() {
  const liveJournals = useLiveQuery<Journal[]>(() =>
    db.journals.orderBy("date").toArray(),
  );
  const liveTasks = useLiveQuery<Task[]>(() => db.tasks.toArray());

  const journals = liveJournals ?? EMPTY_JOURNALS;
  const tasks = liveTasks ?? EMPTY_TASKS;

  const pendingTasksCount = tasks.filter((task) => task.status === "todo").length;

  const today = new Date().toISOString().split("T")[0];
  const todaysJournal = journals.find((journal) => journal.date === today);
  const todaysEnergy = todaysJournal ? todaysJournal.energy : "--";

  const trendData = useMemo(() => {
    const dataMap: Record<
      string,
      { date: string; moodSum: number; energySum: number; count: number }
    > = {};

    journals.forEach((journal) => {
      if (!dataMap[journal.date]) {
        dataMap[journal.date] = {
          date: journal.date,
          moodSum: 0,
          energySum: 0,
          count: 0,
        };
      }

      dataMap[journal.date].moodSum += moodScores[journal.mood] || 3;
      dataMap[journal.date].energySum += journal.energy;
      dataMap[journal.date].count += 1;
    });

    return Object.values(dataMap)
      .map((entry) => ({
        date: entry.date.slice(5),
        Mood: Number((entry.moodSum / entry.count).toFixed(1)),
        Enerji: Number((entry.energySum / entry.count).toFixed(1)),
      }))
      .slice(-7);
  }, [journals]);

  const tagData = useMemo(() => {
    const counts: Record<string, number> = {};

    journals.forEach((journal) => {
      journal.ai_tags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, Değer: value }))
      .sort((a, b) => b.Değer - a.Değer)
      .slice(0, 5);
  }, [journals]);

  const lastInsight = [...journals]
    .reverse()
    .find((journal) => journal.ai_summary)?.ai_summary;

  return (
    <div className="mx-auto max-w-6xl animate-in space-y-6 fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bugün Nasılsın?</h1>
        <p className="text-muted-foreground">
          Kişisel özetin ve yapay zeka analizlerin burada görünecek.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Kayıtları</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journals.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {journals.length === 0
                ? "Henüz kayıt girilmedi"
                : "Toplam kayıt eklendi"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">Bekleyen görev</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Enerji</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysEnergy}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {todaysJournal ? "/ 5 seviyesinde" : "Kayıt bekleniyor"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local AI Durumu</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Hazır</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ollama / Veri bekliyor
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="flex flex-col justify-between p-6 lg:col-span-4">
          <div className="mb-4">
            <h3 className="mb-1 text-lg font-medium">Ruh Hali ve Enerji Trendi</h3>
            <p className="text-sm text-muted-foreground">
              Son 7 günlük ortalamalar (1-5 arası puanlama)
            </p>
          </div>
          <div className="h-[250px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#88888833"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[1, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      color: "#000",
                      border: "none",
                    }}
                    itemStyle={{ fontWeight: "500" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "14px" }} />
                  <Line
                    type="monotone"
                    dataKey="Mood"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Enerji"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed bg-muted/20">
                <p className="text-sm text-muted-foreground">Veri bekleniyor...</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col space-y-4 lg:col-span-3">
          <Card className="flex flex-1 flex-col p-6">
            <div className="mb-4">
              <h3 className="mb-1 text-lg font-medium">AI Konu Dağılımı</h3>
              <p className="text-sm text-muted-foreground">
                Günlüklerinden çıkarılan en sık 5 etiket
              </p>
            </div>
            <div className="mt-auto h-[150px] w-full">
              {tagData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tagData} layout="vertical" margin={{ left: -20 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#88888833"
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13 }}
                      width={90}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        color: "#000",
                        border: "none",
                      }}
                    />
                    <Bar
                      dataKey="Değer"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-md border-2 border-dashed bg-muted/20">
                  <p className="text-sm text-muted-foreground">Yeterli etiket yok.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="flex-1 border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-medium">
              <Brain className="h-5 w-5 text-primary" />
              Son AI İçgörüsü
            </h3>
            <p className="text-sm italic leading-relaxed text-foreground/80">
              {lastInsight
                ? `"${lastInsight}"`
                : "Henüz bir içgörü oluşmadı. Biraz günlük yaz, AI analiz yapsın."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
