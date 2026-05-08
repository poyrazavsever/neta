"use client";

import { ArrowUpRight, Brain, TrendingUp, Zap, Target, ArrowDownRight, BarChart3, Filter } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

// Mock Data
const productivityTrend = [
  { date: "May 1", focus: 65, energy: 40 },
  { date: "May 4", focus: 75, energy: 55 },
  { date: "May 8", focus: 60, energy: 50 },
  { date: "May 12", focus: 85, energy: 70 },
  { date: "May 16", focus: 72, energy: 65 },
  { date: "May 20", focus: 95, energy: 85 },
  { date: "May 24", focus: 88, energy: 80 },
];

const habitCompletion = [
  { name: "Reading", completed: 85, missed: 15 },
  { name: "Workout", completed: 60, missed: 40 },
  { name: "Meditation", completed: 90, missed: 10 },
  { name: "Coding", completed: 75, missed: 25 },
];

const focusRadarData = [
  { subject: "Deep Work", A: 120, fullMark: 150 },
  { subject: "Learning", A: 98, fullMark: 150 },
  { subject: "Health", A: 86, fullMark: 150 },
  { subject: "Networking", A: 65, fullMark: 150 },
  { subject: "Admin", A: 40, fullMark: 150 },
];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Analytics</span> / Performance Metrics
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select className="bg-transparent border-none outline-none text-xs text-foreground cursor-pointer">
              <option className="bg-[#0A0710]">Last 30 Days</option>
              <option className="bg-[#0A0710]">Last Quarter</option>
              <option className="bg-[#0A0710]">This Year</option>
            </select>
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-foreground border border-white/10 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <BarChart3 className="h-4 w-4" />
            EXPORT REPORT
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="h-16 w-16 text-primary" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Total Focus Hours</h3>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-bold text-foreground">124.5</span>
            <span className="text-xs text-emerald-500 flex items-center font-medium mb-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12%
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">vs previous 30 days</div>
        </div>

        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="h-16 w-16 text-emerald-500" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Goal Completion</h3>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-bold text-foreground">82%</span>
            <span className="text-xs text-emerald-500 flex items-center font-medium mb-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 4%
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">vs previous 30 days</div>
        </div>

        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-16 w-16 text-blue-500" />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Productivity Score</h3>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-4xl font-bold text-foreground">9.2</span>
            <span className="text-xs text-rose-500 flex items-center font-medium mb-1">
              <ArrowDownRight className="h-3 w-3 mr-0.5" /> 2%
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">Out of 10.0 max</div>
        </div>

        <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">AI Insight</h3>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed font-medium">
            Your energy peaks consistently around <span className="text-primary font-bold">10:00 AM</span>. Consider scheduling complex tasks during this block to maximize output.
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Main Area Chart */}
        <div className="xl:col-span-2 rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-semibold mb-1">Productivity vs Energy Correlation</h3>
              <p className="text-xs text-muted-foreground">How your physical energy levels impact deep work output.</p>
            </div>
            <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-[#6C5BB0]"></div> Focus Score</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-emerald-500"></div> Energy Level</div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrend}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5BB0" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C5BB0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px", color: "#FBF9FE", borderRadius: "4px" }} 
                  itemStyle={{ color: "#FBF9FE" }}
                />
                <Area type="monotone" dataKey="focus" stroke="#6C5BB0" strokeWidth={2} fillOpacity={1} fill="url(#colorFocus)" />
                <Area type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Charts Stack */}
        <div className="flex flex-col gap-6">
          
          {/* Radar Chart */}
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1 flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Effort Distribution</h3>
            <div className="flex-1 w-full min-h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={focusRadarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8F89A5', fontSize: 10 }} />
                  <Radar name="Effort" dataKey="A" stroke="#6C5BB0" fill="#6C5BB0" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px", color: "#FBF9FE" }} 
                    itemStyle={{ color: "#FBF9FE" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1 flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Habit Consistency</h3>
            <div className="flex-1 w-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitCompletion} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8F89A5' }} width={70} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px", color: "#FBF9FE" }} 
                    itemStyle={{ color: "#FBF9FE" }}
                  />
                  <Bar dataKey="completed" stackId="a" fill="#6C5BB0" radius={[2, 0, 0, 2]} barSize={12} />
                  <Bar dataKey="missed" stackId="a" fill="#2B2538" radius={[0, 2, 2, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
