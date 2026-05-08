"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LogOut, CheckSquare2, Droplets, Moon, Target, Activity, MoreHorizontal, PenTool } from "lucide-react";

// Mock Data
const focusTrendData = [
  { date: "May 12", value: 55 },
  { date: "May 13", value: 42 },
  { date: "May 14", value: 60 },
  { date: "May 15", value: 85 },
  { date: "May 16", value: 72 },
  { date: "May 17", value: 87 },
  { date: "May 18", value: 100 },
];

const sleepData = [
  { day: "M", value: 6.5 },
  { day: "T", value: 7.2 },
  { day: "W", value: 5.8 },
  { day: "T", value: 6.1 },
  { day: "F", value: 8.0 },
  { day: "S", value: 7.5 },
  { day: "S", value: 8.5 },
];

const waterData = [
  { day: "M", value: 1.5 },
  { day: "T", value: 2.1 },
  { day: "W", value: 1.8 },
  { day: "T", value: 2.5 },
  { day: "F", value: 2.0 },
  { day: "S", value: 3.0 },
  { day: "S", value: 2.8 },
];

const moodData = [
  { day: "M", value: 60 },
  { day: "T", value: 85 },
  { day: "W", value: 70 },
  { day: "T", value: 65 },
  { day: "F", value: 80 },
  { day: "S", value: 90 },
  { day: "S", value: 95 },
];

const focusDistributionData = [
  { name: "Deep Work", value: 45, color: "#6C5BB0" },
  { name: "Shallow Work", value: 30, color: "#54468B" },
  { name: "Meetings", value: 15, color: "#3B3161" },
  { name: "Breaks", value: 10, color: "#221C38" },
];

const upcomingEvents = [
  { time: "10:00 AM", title: "Deep Work Session", category: "FOCUS", color: "border-l-pink-500" },
  { time: "12:30 PM", title: "Team Standup", category: "MEETING", color: "border-l-orange-500" },
  { time: "02:00 PM", title: "Project Review", category: "WORK", color: "border-l-blue-500" },
  { time: "04:00 PM", title: "Workout", category: "HEALTH", color: "border-l-emerald-500" },
  { time: "07:00 PM", title: "Daily Reflection", category: "PERSONAL", color: "border-l-purple-500" },
];

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 text-foreground font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Dashboard</span> / Overview
        </h1>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
          <Plus className="h-4 w-4" />
          QUICK ADD
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Focus Trend (Takes 2 columns on XL) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1 min-h-[400px]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Focus Trend</h3>
                <div className="text-5xl font-bold mb-1 text-primary">87<span className="text-2xl">%</span></div>
                <div className="text-sm text-muted-foreground">Average Focus Score</div>
              </div>
              <div className="flex items-center gap-3">
                <select className="bg-transparent border border-white/10 rounded-sm text-xs px-3 py-1.5 outline-none focus:border-primary/50 cursor-pointer">
                  <option className="bg-[#0A0710]">7 DAYS</option>
                  <option className="bg-[#0A0710]">14 DAYS</option>
                  <option className="bg-[#0A0710]">30 DAYS</option>
                </select>
                <button className="p-1.5 border border-white/10 rounded-sm hover:bg-white/5 transition-colors">
                  <Activity className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={focusTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#8F89A5' }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#8F89A5' }} 
                    width={30}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F172B", borderColor: "#3B3448", borderRadius: "4px", fontSize: "12px" }}
                    itemStyle={{ color: "#6C5BB0" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6C5BB0" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#1F172B", strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: "#6C5BB0", stroke: "#1F172B" }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Add & Upcoming */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Add */}
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Quick Add</h3>
            <div className="bg-[#150F1D] border border-white/5 rounded-sm p-3 mb-4">
              <input 
                type="text" 
                placeholder="What's on your mind?" 
                className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 border border-white/5 rounded-sm py-3 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                <PenTool className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-wider">NOTE</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 border border-white/5 rounded-sm py-3 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                <Target className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-wider">HABIT</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 border border-white/5 rounded-sm py-3 hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                <CheckSquare2 className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-wider">GOAL</span>
              </button>
            </div>
          </div>

          {/* Upcoming */}
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</h3>
              <button className="text-[10px] uppercase font-semibold text-muted-foreground hover:text-foreground">View All</button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="flex items-center text-sm py-1">
                  <div className={`w-1 h-10 ${event.color} border-l-2 mr-4 rounded-full`}></div>
                  <div className="w-20 text-muted-foreground text-xs">{event.time}</div>
                  <div className="flex-1 font-medium">{event.title}</div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{event.category}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM ROW: Mini Charts & Donut */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Sleep Hours */}
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sleep Hours</h3>
            <Moon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">7.2</span>
              <span className="text-[10px] text-muted-foreground tracking-wider">HOURS</span>
            </div>
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8F89A5' }} dy={5} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px" }} />
                  <Bar dataKey="value" fill="#6C5BB0" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-primary">Goal: 7-8 Hours</div>
          </div>
        </div>

        {/* Water Intake */}
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Water Intake</h3>
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">2.1</span>
              <span className="text-[10px] text-muted-foreground tracking-wider">LITERS</span>
            </div>
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8F89A5' }} dy={5} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px" }} />
                  <Bar dataKey="value" fill="#6C5BB0" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-primary">Goal: 2.5L</div>
          </div>
        </div>

        {/* Mood Score */}
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mood Score</h3>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">78</span>
              <span className="text-[10px] text-muted-foreground tracking-wider">/100</span>
            </div>
            <div className="h-[80px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8F89A5' }} dy={5} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px" }} />
                  <Bar dataKey="value" fill="#6C5BB0" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-primary">Positive</div>
          </div>
        </div>

        {/* Focus Distribution */}
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Focus Distribution</h3>
          <div className="flex items-center justify-between h-[160px]">
            <div className="w-[140px] h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={focusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {focusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px", color: "#FBF9FE" }} 
                    itemStyle={{ color: "#FBF9FE" }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 ml-6 space-y-3">
              {focusDistributionData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quote Footer */}
      <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="bg-[#150F1D] text-muted-foreground border border-white/5 p-2 rounded-sm">
            <MoreHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-1">SYSTEM REMINDER</div>
            <div className="text-sm">"Discipline is the bridge between goals and accomplishment."</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground italic">- Jim Rohn</div>
      </div>

    </div>
  );
}
