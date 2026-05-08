"use client";

import { useState } from "react";
import { 
  ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, 
  Clock, Filter, MoreHorizontal, Brain, X, Check, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const categories = [
  { name: "Deep Work", color: "bg-[#6C5BB0]" },
  { name: "Meetings", color: "bg-orange-500" },
  { name: "Project Deadlines", color: "bg-blue-500" },
  { name: "Health & Habits", color: "bg-emerald-500" },
];

const mockEvents = [
  { day: 2, title: "Q3 Planning", type: "Meetings", time: "10:00 AM", colorClass: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { day: 5, title: "Deep Work Session", type: "Deep Work", time: "09:00 AM", colorClass: "bg-[#6C5BB0]/10 text-[#a798e8] border-[#6C5BB0]/20" },
  { day: 5, title: "UI Review", type: "Project Deadlines", time: "02:00 PM", colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { day: 12, title: "Frontend Deploy", type: "Project Deadlines", time: "11:00 AM", colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { day: 15, title: "1:1 with Alex", type: "Meetings", time: "01:30 PM", colorClass: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { day: 15, title: "Gym", type: "Health & Habits", time: "06:00 PM", colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { day: 18, title: "Focus Block", type: "Deep Work", time: "08:00 AM", colorClass: "bg-[#6C5BB0]/10 text-[#a798e8] border-[#6C5BB0]/20" },
  { day: 22, title: "Reading", type: "Health & Habits", time: "09:00 PM", colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { day: 25, title: "Client Demo", type: "Project Deadlines", time: "03:00 PM", colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { day: 28, title: "Retrospective", type: "Meetings", time: "04:00 PM", colorClass: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const generateCalendarDays = () => {
  const days = [];
  days.push({ empty: true, key: "empty-0" });
  for (let i = 1; i <= 30; i++) {
    const events = mockEvents.filter((e) => e.day === i);
    days.push({ empty: false, day: i, events, isToday: i === 15 });
  }
  const remaining = 35 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ empty: true, key: `empty-end-${i}` });
  }
  return days;
};

export default function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const calendarDays = generateCalendarDays();

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => setIsOptimizing(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans relative">
      
      {/* Optimization Overlay */}
      <AnimatePresence>
        {isOptimizing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0A0710]/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mb-6"
            >
              <Brain className="h-16 w-16 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2">AI Schedule Optimization</h2>
            <p className="text-muted-foreground text-sm">Analyzing energy trends and focus blocks...</p>
            <div className="w-48 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-full h-full bg-primary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Calendar</span> / Monthly View
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button 
            onClick={() => setSelectedDay({ day: 15, events: mockEvents.filter(e => e.day === 15) })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            NEW EVENT
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Left Sidebar Panel */}
        <div className="hidden lg:flex flex-col gap-6">
          
          {/* Mini Calendar Mock */}
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold">May 2026</span>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-white/5 rounded-sm text-muted-foreground transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                <button className="p-1 hover:bg-white/5 rounded-sm text-muted-foreground transition-colors"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground font-semibold mb-2">
              <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              <div className="text-muted-foreground/30 py-1">27</div>
              {[...Array(30)].map((_, i) => (
                <div 
                  key={i} 
                  className={`py-1 rounded-sm cursor-pointer hover:bg-white/5 transition-colors ${i + 1 === 15 ? 'bg-primary/20 text-primary font-bold' : ''}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Calendars / Categories */}
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5 flex-1">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Calendars</h3>
              <button className="text-muted-foreground hover:text-foreground"><Filter className="h-3.5 w-3.5" /></button>
            </div>
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-3 h-3 rounded-sm ${cat.color} ring-2 ring-transparent group-hover:ring-white/10 transition-all shadow-[0_0_8px_rgba(108,91,176,0.3)]`}></div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Optimizer Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="rounded-sm border border-primary/20 bg-primary/5 p-5 flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
              <Brain className="h-24 w-24 text-primary" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">AI Optimizer</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Detected focus peak at 10 AM on Thursdays. Suggest moving **UI Review** to maximize alignment.
            </p>
            <button 
              onClick={handleOptimize}
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all mt-2 text-center flex justify-center w-full"
            >
              Run AI Optimization
            </button>
          </motion.div>

        </div>

        {/* Main Calendar View */}
        <div className="lg:col-span-3 flex flex-col rounded-sm border border-white/5 bg-[#0A0710] overflow-hidden">
          
          {/* Calendar Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0F0B15]/30">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">May 2026</h2>
              <div className="flex items-center bg-[#150F1D] border border-white/5 rounded-sm p-0.5">
                <button className="p-1 hover:bg-white/5 rounded-sm transition-colors text-muted-foreground"><ChevronLeft className="h-4 w-4" /></button>
                <button className="px-3 py-1 text-xs font-medium hover:bg-white/5 rounded-sm transition-colors text-foreground">Today</button>
                <button className="p-1 hover:bg-white/5 rounded-sm transition-colors text-muted-foreground"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#150F1D] border border-white/5 rounded-sm p-0.5">
              <button className="px-3 py-1.5 text-xs font-medium rounded-sm text-muted-foreground hover:text-foreground transition-colors">Day</button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-sm text-muted-foreground hover:text-foreground transition-colors">Week</button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-sm bg-[#2B2538] text-foreground shadow-sm">Month</button>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-white/5 bg-[#0F0B15]/50">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden bg-white/[0.02] gap-[1px]">
            {calendarDays.map((cell, idx) => (
              <motion.div 
                key={cell.key || cell.day} 
                whileHover={{ backgroundColor: "rgba(15, 11, 21, 0.8)" }}
                onClick={() => !cell.empty && setSelectedDay(cell)}
                className={`bg-[#0A0710] p-2 flex flex-col gap-1 transition-all cursor-pointer relative group ${cell.empty ? 'opacity-30 pointer-events-none' : ''}`}
              >
                {!cell.empty && (
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-sm transition-colors ${cell.isToday ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(108,91,176,0.5)]' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {cell.day}
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto tiny-scrollbar flex flex-col gap-1 pr-1">
                  {cell.events?.map((event, eIdx) => (
                    <motion.div 
                      key={eIdx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01 + eIdx * 0.05 }}
                      className={`text-[9px] px-1.5 py-1 rounded-sm border truncate font-bold tracking-tight transition-all hover:scale-[1.02] active:scale-95 ${event.colorClass}`}
                    >
                      {event.title}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Entry Sheet */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0F0B15]/50">
                <div>
                  <h2 className="text-xl font-bold">May {selectedDay.day}, 2026</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Daily Schedule Overview</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/5 rounded-sm transition-colors text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Scheduled Events
                  </h3>
                  <div className="space-y-3">
                    {selectedDay.events?.length > 0 ? (
                      selectedDay.events.map((event: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-sm border border-white/5 bg-[#150F1D] flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className={`w-1 h-8 rounded-full ${event.colorClass.split(' ')[0]}`} />
                            <div>
                              <div className="text-sm font-bold">{event.title}</div>
                              <div className="text-[10px] text-muted-foreground">{event.time} • {event.type}</div>
                            </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/5 rounded-sm transition-opacity">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic px-2">No events scheduled for this day.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Quick Add Event</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">TIME</label>
                        <input type="time" className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-3 py-2 text-xs outline-none focus:border-primary/50" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground">CATEGORY</label>
                        <select className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-3 py-2 text-xs outline-none focus:border-primary/50">
                          {categories.map(c => <option key={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground">EVENT TITLE</label>
                      <input type="text" placeholder="e.g., Team Sync" className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-3 py-2 text-xs outline-none focus:border-primary/50" />
                    </div>
                    <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-sm text-xs font-bold tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                      ADD TO CALENDAR
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
