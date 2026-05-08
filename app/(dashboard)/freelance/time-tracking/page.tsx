"use client";

import { Play, Pause, Brain, Clock, Plus, Tag, ArrowUpRight, DollarSign, Activity } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";

// Mock Data
const timeData = [
  { day: "Mon", billable: 5, nonBillable: 1 },
  { day: "Tue", billable: 6.5, nonBillable: 0.5 },
  { day: "Wed", billable: 4, nonBillable: 2 },
  { day: "Thu", billable: 7, nonBillable: 1 },
  { day: "Fri", billable: 5.5, nonBillable: 1.5 },
];

const timeLogs = [
  { id: 1, task: "Database Schema Design", project: "Stark Enterprise App", duration: "02:45:00", date: "Today", billable: true },
  { id: 2, client: "Acme Corp", task: "Weekly Sync & Planning", project: "Retainer", duration: "01:00:00", date: "Today", billable: true },
  { id: 3, task: "Invoice Generation & Emails", project: "Admin", duration: "00:45:00", date: "Yesterday", billable: false },
  { id: 4, task: "Frontend Component Refactor", project: "Stark Enterprise App", duration: "04:15:00", date: "Yesterday", billable: true },
];

export default function TimeTrackingPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Freelance</span> / Time Tracking
        </h1>
      </div>

      {/* Active Timer & AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Timer Widget */}
        <div className="rounded-sm border border-primary/30 bg-[#0F0B15] p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(108,91,176,0.15)]">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Tracking</span>
          </div>
          
          <div className="text-6xl font-black text-foreground font-mono tracking-tight mt-6 mb-4">
            01<span className="text-muted-foreground/30">:</span>24<span className="text-muted-foreground/30">:</span>56
          </div>
          
          <div className="text-sm text-muted-foreground mb-6 text-center">
            <strong className="text-foreground">Stark Enterprise App</strong><br/>
            API Route Optimization
          </div>

          <div className="flex gap-4">
            <button className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
              <Pause className="h-5 w-5 fill-current" />
            </button>
            <button className="h-12 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-colors">
              Submit Time
            </button>
          </div>
        </div>

        {/* AI Invoice Suggester */}
        <div className="lg:col-span-2 rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-primary">AI Invoice Suggester</h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-6">
            You have logged <strong>14.5 unbilled hours</strong> for <strong>Stark Industries</strong> this week. Based on your hourly rate of $120/hr, the unbilled amount is <span className="text-emerald-400 font-bold">$1,740</span>. AI suggests generating an invoice today as their accounting cycle ends on the 15th.
          </p>
          <div className="flex gap-3">
            <button className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-2 rounded-sm text-xs font-semibold transition-colors flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Generate $1,740 Invoice
            </button>
            <button className="bg-transparent hover:bg-white/5 text-foreground border border-white/10 px-4 py-2 rounded-sm text-xs font-semibold transition-colors">
              View Time Report
            </button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[300px] pb-6">
        
        {/* Weekly Chart */}
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">This Week</h3>
            <span className="text-lg font-bold">28h 00m</span>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="colorBillable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5BB0" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C5BB0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8F89A5' }} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px", color: "#FBF9FE", borderRadius: "4px" }} 
                  itemStyle={{ color: "#FBF9FE" }}
                />
                <Area type="monotone" dataKey="billable" stroke="#6C5BB0" strokeWidth={2} fillOpacity={1} fill="url(#colorBillable)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Logs */}
        <div className="lg:col-span-2 bg-[#0A0710] rounded-sm border border-white/5 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Time Logs</h3>
            <button className="text-xs text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-white/5 flex-1 overflow-y-auto tiny-scrollbar">
            {timeLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-10 rounded-full ${log.billable ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-0.5">{log.task}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      <span className="bg-[#150F1D] px-1.5 py-0.5 rounded-sm border border-white/5">{log.project}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-base font-bold font-mono">{log.duration}</div>
                  <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                    <Play className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
