"use client";

import { useState, useEffect } from "react";
import { 
  Play, Pause, Square, Plus, Search, Clock, 
  BarChart3, Calendar, MoreHorizontal, X, 
  CheckCircle2, AlertCircle, Brain, Zap,
  TrendingUp, Activity, Briefcase, User, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// Mock Data
const todayTimeData = [
  { name: "Deep Work", value: 240, color: "#6C5BB0" },
  { name: "Meetings", value: 90, color: "#a798e8" },
  { name: "Learning", value: 45, color: "#10b981" },
  { name: "Admin", value: 30, color: "#3b82f6" },
];

const weeklyTimeData = [
  { day: "Mon", hours: 8.5 },
  { day: "Tue", hours: 7.2 },
  { day: "Wed", hours: 9.0 },
  { day: "Thu", hours: 6.5 },
  { day: "Fri", hours: 8.0 },
  { day: "Sat", hours: 2.5 },
  { day: "Sun", hours: 0 },
];

const recentLogs = [
  { id: 1, task: "Database Migration Script", project: "Infrastructure", duration: "2h 15m", date: "Today, 10:30 AM", type: "Deep Work" },
  { id: 2, task: "UI Review & Polish", project: "Marketing Site", duration: "1h 45m", date: "Today, 02:00 PM", type: "Creative" },
  { id: 3, task: "Client Strategy Sync", project: "Acme Corp", duration: "1h 00m", date: "Yesterday", type: "Meeting" },
  { id: 4, task: "Security Audit", project: "Infrastructure", duration: "3h 30m", date: "Yesterday", type: "Deep Work" },
];

export default function TimeTrackingPage() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Performance</span> / Time Intelligence
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-sm border border-primary/10">
            <Clock className="h-3 w-3" /> 38.5 HOURS LOGGED THIS WEEK
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-[#150F1D] hover:bg-white/5 text-foreground border border-white/10 px-4 py-1.5 rounded-sm text-xs font-bold tracking-widest flex items-center gap-2 transition-all">
            <Plus className="h-4 w-4" />
            MANUAL LOG
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
        
        {/* Left: Active Timer & Recent Logs */}
        <div className="xl:col-span-2 flex flex-col gap-8 overflow-hidden">
          
          {/* Active Timer Attraction */}
          <div className="bg-[#0A0710] border border-white/5 rounded-sm p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,91,176,0.05),transparent)] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-md">
              <div className="text-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Current Focus Block</div>
                <h2 className="text-6xl font-black tracking-tighter tabular-nums text-foreground">{formatTime(seconds)}</h2>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-4 bg-[#150F1D] border border-white/10 rounded-sm px-6 py-4">
                  <div className="p-2 bg-primary/10 rounded-sm"><Briefcase className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project</div>
                    <div className="text-sm font-bold">Marketing Site Redesign</div>
                  </div>
                  <div className="h-8 w-px bg-white/5" />
                  <div className="flex-1 text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Task</div>
                    <div className="text-sm font-bold truncate">UI Audit & Review</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-sm text-sm font-black uppercase tracking-widest transition-all shadow-xl ${isActive ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-primary text-primary-foreground shadow-primary/20'}`}
                  >
                    {isActive ? <><Pause className="h-5 w-5" /> PAUSE TIMER</> : <><Play className="h-5 w-5" /> START FOCUS</>}
                  </button>
                  <button 
                    onClick={() => {setIsActive(false); setSeconds(0);}}
                    className="px-8 bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 transition-all rounded-sm"
                  >
                    <Square className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Logs Table */}
          <div className="bg-[#0A0710] border border-white/5 rounded-sm flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-[#0F0B15]/40 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Today's Activity Ledger</h3>
              <button className="text-[10px] font-bold text-primary uppercase tracking-widest">Full History</button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-auto tiny-scrollbar">
              <div className="min-w-[600px] divide-y divide-white/5">
                {recentLogs.map(log => (
                  <div key={log.id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/[0.02] transition-all group">
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-sm bg-white/5 flex items-center justify-center"><Clock className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
                      <div className="min-w-0">
                        <div className="text-sm font-black truncate">{log.task}</div>
                        <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{log.project} • {log.type}</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-xs font-black text-muted-foreground uppercase">{log.date}</div>
                    <div className="col-span-2 text-sm font-black text-foreground">{log.duration}</div>
                    <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>

        {/* Right: Analytics & AI */}
        <div className="flex flex-col gap-8">
          
          {/* Daily Distribution Chart */}
          <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex flex-col shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Daily Distribution</h3>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={todayTimeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {todayTimeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#150F1D", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
              {todayTimeData.map(item => (
                <div key={item.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span>{Math.floor(item.value / 60)}h {item.value % 60}m</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Productivity Pulse */}
          <div className="bg-primary/5 border border-primary/20 rounded-sm p-8 flex flex-col gap-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 rotate-12 transition-transform group-hover:scale-110">
              <Brain className="h-24 w-24 text-primary" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-sm shadow-inner"><Brain className="h-4 w-4 text-primary" /></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Focus Analysis</h3>
              </div>
              <p className="text-sm font-bold leading-relaxed text-foreground/90 italic">
                "Your deep work output is highest between 9:00 AM and 11:30 AM. Weekly burnout risk is Low (12%). Strategic momentum is positive."
              </p>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group/btn border-b border-primary/20 pb-1 self-start hover:border-primary transition-all">
              VIEW BURN RATE <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Weekly Summary Stat */}
          <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex flex-col gap-6 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Weekly Performance</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTimeData}>
                  <Bar dataKey="hours" fill="#6C5BB0" radius={[2, 2, 0, 0]} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: "#150F1D", border: "none" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Average / Day</div>
                <div className="text-2xl font-black">7.4h</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                  <TrendingUp className="h-3 w-3" /> +12% VS LAST WEEK
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
