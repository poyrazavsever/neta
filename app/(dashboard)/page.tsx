"use client";

import { useState } from "react";
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
import { 
  CheckSquare2, Droplets, Moon, Target, Activity, 
  MoreHorizontal, PenTool, Plus, GripVertical, Maximize2 
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { QuickActionsSheet } from "@/components/dashboard/quick-actions-sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

type WidgetId = "sleep" | "water" | "mood" | "distribution";

export default function DashboardPage() {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<WidgetId | null>(null);
  
  // Widget ordering state
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(["sleep", "water", "mood", "distribution"]);

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 text-foreground font-sans pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Dashboard</span> / Overview
        </h1>
        <button 
          onClick={() => setIsQuickActionOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          QUICK ADD
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Focus Trend (Takes 2 columns on XL) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="group rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1 min-h-[400px] relative">
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
          
          {/* AI Strategy Suggestion (Replacing Quick Add Input) */}
          <div className="rounded-sm border border-primary/20 bg-[#1F172B] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Activity className="h-24 w-24 text-primary" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              AI Insight
            </h3>
            <p className="text-sm font-medium leading-relaxed mb-4">
              "Based on your 100% focus score yesterday, you have high mental momentum. Schedule your hardest task for 10:00 AM today."
            </p>
            <button className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/50 pb-0.5 hover:border-primary transition-all">
              Apply Suggestion
            </button>
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

      {/* BOTTOM ROW: Draggable Widgets */}
      <Reorder.Group 
        axis="x" 
        values={widgetOrder} 
        onReorder={setWidgetOrder}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {widgetOrder.map((id) => (
          <Reorder.Item 
            key={id} 
            value={id}
            className="cursor-default"
          >
            {id === "sleep" && (
              <WidgetCard 
                title="Sleep Hours" 
                icon={Moon} 
                value="7.2" 
                unit="HOURS" 
                goal="7-8 Hours"
                data={sleepData}
                onExpand={() => setSelectedKpi("sleep")}
              />
            )}
            {id === "water" && (
              <WidgetCard 
                title="Water Intake" 
                icon={Droplets} 
                value="2.1" 
                unit="LITERS" 
                goal="2.5L"
                data={waterData}
                onExpand={() => setSelectedKpi("water")}
              />
            )}
            {id === "mood" && (
              <WidgetCard 
                title="Mood Score" 
                icon={Activity} 
                value="78" 
                unit="/100" 
                goal="Positive"
                data={moodData}
                onExpand={() => setSelectedKpi("mood")}
              />
            )}
            {id === "distribution" && (
              <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 h-full flex flex-col group relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <div className="p-1 hover:bg-white/5 rounded-sm cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Focus Distribution</h3>
                <div className="flex items-center justify-between gap-4">
                  <div className="w-[100px] h-[100px] relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={focusDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {focusDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {focusDistributionData.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5 truncate mr-2">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                          <span className="text-muted-foreground truncate">{item.name}</span>
                        </div>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Quote Footer */}
      <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex justify-between items-center group">
        <div className="flex gap-4 items-center">
          <div className="bg-[#150F1D] text-muted-foreground border border-white/5 p-2 rounded-sm group-hover:text-primary transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-1">SYSTEM REMINDER</div>
            <div className="text-sm">"Discipline is the bridge between goals and accomplishment."</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground italic">- Jim Rohn</div>
      </div>

      {/* Sheet & Modals */}
      <QuickActionsSheet 
        isOpen={isQuickActionOpen} 
        onClose={() => setIsQuickActionOpen(false)} 
      />

      <Dialog open={!!selectedKpi} onOpenChange={() => setSelectedKpi(null)}>
        <DialogContent className="bg-[#0A0710] border-white/5 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {selectedKpi === "sleep" && <><Moon className="h-5 w-5 text-primary" /> Sleep Analysis</>}
              {selectedKpi === "water" && <><Droplets className="h-5 w-5 text-primary" /> Hydration Trends</>}
              {selectedKpi === "mood" && <><Activity className="h-5 w-5 text-primary" /> Mood Tracking</>}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedKpi === "sleep" ? sleepData : selectedKpi === "water" ? waterData : moodData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8F89A5' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8F89A5' }} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }} 
                  contentStyle={{ backgroundColor: "#1F172B", border: "none", borderRadius: "4px" }} 
                />
                <Bar dataKey="value" fill="#6C5BB0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-sm border border-white/5 bg-[#150F1D]">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">AI Observation</h4>
              <p className="text-sm">Your consistency is up 12% from last week. Keep this pace for optimal performance.</p>
            </div>
            <div className="p-4 rounded-sm border border-white/5 bg-[#150F1D]">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Recommendation</h4>
              <p className="text-sm">Try to reach your goal by increasing focus in the evening blocks.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function WidgetCard({ title, icon: Icon, value, unit, goal, data, onExpand }: any) {
  return (
    <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 h-full flex flex-col justify-between group relative">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button onClick={onExpand} className="p-1 hover:bg-white/5 rounded-sm transition-colors">
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
        </button>
        <div className="p-1 hover:bg-white/5 rounded-sm cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-bold">{value}</span>
          <span className="text-[10px] text-muted-foreground tracking-wider">{unit}</span>
        </div>
        <div className="h-[80px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="day" hide />
              <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px" }} />
              <Bar dataKey="value" fill="#6C5BB0" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-primary">Goal: {goal}</div>
      </div>
    </div>
  );
}
