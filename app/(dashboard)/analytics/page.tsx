"use client";

import { useState } from "react";
import { 
  ArrowUpRight, Brain, TrendingUp, Zap, Target, ArrowDownRight, 
  BarChart3, Filter, Download, Info, CheckCircle2, AlertCircle
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, Cell
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

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
  { name: "Reading", completed: 85, missed: 15, color: "#6C5BB0" },
  { name: "Workout", completed: 60, missed: 40, color: "#a798e8" },
  { name: "Meditation", completed: 90, missed: 10, color: "#10b981" },
  { name: "Coding", completed: 75, missed: 25, color: "#3b82f6" },
];

const focusRadarData = [
  { subject: "Deep Work", A: 120, fullMark: 150 },
  { subject: "Learning", A: 98, fullMark: 150 },
  { subject: "Health", A: 86, fullMark: 150 },
  { subject: "Networking", A: 65, fullMark: 150 },
  { subject: "Admin", A: 40, fullMark: 150 },
];

export default function AnalyticsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeInsight, setActiveInsight] = useState<string | null>(null);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12">
      
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
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`min-w-[140px] px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center justify-center gap-2 transition-all ${isExporting ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10'}`}
          >
            {isExporting ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Download className="h-4 w-4" />
                </motion.div>
                GENERATING...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                EXPORT REPORT
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard title="Total Focus Hours" value="124.5" change="+12%" icon={Zap} trend="up" />
        <KpiCard title="Goal Completion" value="82%" change="+4%" icon={Target} trend="up" color="emerald" />
        <KpiCard title="Productivity Score" value="9.2" change="-2%" icon={TrendingUp} trend="down" color="blue" />
        
        {/* Dynamic AI Score Ring */}
        <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 relative overflow-hidden group flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Strategic Readiness</h3>
            <div className="text-3xl font-black text-foreground">94<span className="text-sm font-normal opacity-60 ml-1">%</span></div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Optimal alignment with goals.</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-white/5" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 0.94 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeDasharray="100, 100" 
                fill="none" 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Productivity Chart with Hotspots */}
        <div className="xl:col-span-2 rounded-sm border border-white/5 bg-[#0A0710] p-8 flex flex-col relative">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold mb-1">Correlation: Focus vs Energy</h3>
              <p className="text-sm text-muted-foreground">Detailed visual mapping of biological energy impact on focus output.</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#6C5BB0]"></div> Focus</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Energy</div>
            </div>
          </div>

          {/* Chart Interaction Layer */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex gap-4">
            <button 
              onMouseEnter={() => setActiveInsight("Your energy and focus peaked together on May 20. This suggests your evening rest was highly effective.")}
              onMouseLeave={() => setActiveInsight(null)}
              className="p-2 bg-primary/20 border border-primary/40 rounded-full text-primary hover:scale-110 transition-transform animate-pulse"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence>
            {activeInsight && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-36 left-1/2 -translate-x-1/2 z-20 w-64 p-3 bg-[#1F172B] border border-primary/30 rounded-sm shadow-2xl text-[11px] leading-relaxed text-foreground"
              >
                <div className="flex items-center gap-2 mb-1 text-primary font-bold uppercase tracking-widest">
                  <Brain className="h-3 w-3" /> AI Observation
                </div>
                {activeInsight}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrend}>
                <defs>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5BB0" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6C5BB0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5' }} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#6C5BB0', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: "#150F1D", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", color: "#FBF9FE", borderRadius: "4px" }} 
                />
                <Area type="monotone" dataKey="focus" stroke="#6C5BB0" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                <Area type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="flex flex-col gap-6">
          
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1 flex flex-col">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Effort Distribution</h3>
            <div className="flex-1 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={focusRadarData}>
                  <PolarGrid stroke="#ffffff05" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8F89A5', fontSize: 10, fontWeight: 600 }} />
                  <Radar name="Effort" dataKey="A" stroke="#6C5BB0" strokeWidth={2} fill="#6C5BB0" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Strategic Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-sm bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-400">Habit Streak Maintained</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Reading streak is now at 12 days. Energy levels are correlating positively.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-sm bg-orange-500/5 border border-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-orange-400">Admin Overload</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Admin tasks have increased by 15%. Consider automating these via Cognis AI.</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon: Icon, trend, color = "primary" }: any) {
  const isUp = trend === "up";
  const trendColor = isUp ? "text-emerald-500" : "text-rose-500";
  
  return (
    <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color === 'primary' ? 'text-primary' : color === 'emerald' ? 'text-emerald-500' : 'text-blue-500'}`}>
        <Icon className="h-16 w-16" />
      </div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">{title}</h3>
      <div className="flex items-end gap-3 mb-1">
        <span className="text-4xl font-black text-foreground tracking-tight">{value}</span>
        <span className={`text-[10px] flex items-center font-bold mb-1.5 px-1.5 py-0.5 rounded-sm bg-white/5 ${trendColor}`}>
          {isUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />} {change}
        </span>
      </div>
      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">vs previous 30 days</div>
    </div>
  );
}
