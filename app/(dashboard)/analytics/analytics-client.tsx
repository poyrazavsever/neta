"use client";

import { useState } from "react";
import { Card, CardContent } from "poyraz-ui/atoms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "poyraz-ui/molecules";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { BarChart3, Filter } from "lucide-react";

export type AnalyticsData = {
  tasks: { id: string; status: string; created_at: string; due_at?: string }[];
  projects: { id: string; name: string }[];
  finances: { id: string; type: string; amount: number; transaction_date: string; project_id?: string }[];
};

type AnalyticsClientProps = {
  data: AnalyticsData;
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#eab308", "#3b82f6", "#8b5cf6"];

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const [dateRange, setDateRange] = useState("this_month");
  
  const now = new Date();
  
  const filterByDate = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (dateRange === "this_week") {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
      return date >= firstDay;
    }
    if (dateRange === "this_month") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (dateRange === "this_year") {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredFinances = data.finances.filter(f => filterByDate(f.transaction_date));
  const filteredTasks = data.tasks.filter(t => filterByDate(t.created_at || t.due_at));

  // Project-based income
  const projectIncomeMap = new Map();
  filteredFinances.filter(f => f.type === "income" && f.project_id).forEach(f => {
    const project = data.projects.find(p => p.id === f.project_id);
    const name = project ? project.name : "Bilinmeyen";
    if (!projectIncomeMap.has(name)) {
      projectIncomeMap.set(name, { name, value: 0 });
    }
    projectIncomeMap.get(name).value += Number(f.amount);
  });
  const projectIncomeData = Array.from(projectIncomeMap.values());

  // Task completion stats
  const completedTasks = filteredTasks.filter(t => t.status === "completed").length;
  const activeTasks = filteredTasks.filter(t => t.status !== "completed" && t.status !== "cancelled").length;
  
  const taskStatusData = [
    { name: "Tamamlanan", value: completedTasks },
    { name: "Devam Eden", value: activeTasks }
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Analizler
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Performans ve Finans Analizi
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Müşteri bazlı gelirler, görev tamamlama oranları ve proje ilerleme grafikleri.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tarih aralığı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">Bu Hafta</SelectItem>
              <SelectItem value="this_month">Bu Ay</SelectItem>
              <SelectItem value="this_year">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-6 text-sm font-semibold text-foreground">Proje Bazlı Gelir Dağılımı</h3>
            <div className="h-[300px] w-full">
              {projectIncomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectIncomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectIncomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `₺${value}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.375rem',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Veri bulunamadı.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="mb-6 text-sm font-semibold text-foreground">Görev Durumu Analizi</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.375rem',
                    }} 
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
