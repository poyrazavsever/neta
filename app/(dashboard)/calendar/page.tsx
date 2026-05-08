"use client";

import { ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon, Clock, Filter, MoreHorizontal, Brain } from "lucide-react";

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

// Generates a mock calendar grid for a 30-day month starting on a Tuesday
const generateCalendarDays = () => {
  const days = [];
  // 1 empty slot for Monday before the 1st
  days.push({ empty: true, key: "empty-0" });
  for (let i = 1; i <= 30; i++) {
    const events = mockEvents.filter((e) => e.day === i);
    days.push({ empty: false, day: i, events, isToday: i === 15 });
  }
  // Fill the rest of the grid (35 total cells for a 5-week view)
  const remaining = 35 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ empty: true, key: `empty-end-${i}` });
  }
  return days;
};

export default function CalendarPage() {
  const calendarDays = generateCalendarDays();

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
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
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
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
                  className={`py-1 rounded-sm cursor-pointer hover:bg-white/5 ${i + 1 === 15 ? 'bg-primary/20 text-primary font-bold' : ''}`}
                >
                  {i + 1}
                </div>
              ))}
              <div className="text-muted-foreground/30 py-1">1</div>
              <div className="text-muted-foreground/30 py-1">2</div>
              <div className="text-muted-foreground/30 py-1">3</div>
              <div className="text-muted-foreground/30 py-1">4</div>
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
                  <div className={`w-3 h-3 rounded-sm ${cat.color} ring-2 ring-transparent group-hover:ring-white/10 transition-all`}></div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
                </label>
              ))}
            </div>
            
            <div className="mt-8 mb-5 border-t border-white/5 pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shared Context</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-3 h-3 rounded-sm border border-muted-foreground/40 group-hover:border-muted-foreground transition-all"></div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Team Holidays</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-3 h-3 rounded-sm bg-muted-foreground/40 group-hover:bg-muted-foreground transition-all"></div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Company Events</span>
              </label>
            </div>
          </div>

          {/* AI Features */}
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">AI Assistant</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Based on your energy trends, I suggest moving the <strong>UI Review</strong> to Thursday afternoon.
            </p>
            <button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors mt-2 text-center flex justify-center w-full">
              Auto-Optimize Schedule
            </button>
          </div>

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

          {/* Calendar Header (Days) */}
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
              <div 
                key={cell.key || cell.day} 
                className={`bg-[#0A0710] p-2 flex flex-col gap-1 transition-colors hover:bg-[#0F0B15] relative group ${cell.empty ? 'opacity-30' : ''}`}
              >
                {!cell.empty && (
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-sm ${cell.isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {cell.day}
                  </div>
                )}
                
                {/* Events */}
                <div className="flex-1 overflow-y-auto tiny-scrollbar flex flex-col gap-1 pr-1">
                  {cell.events?.map((event, eIdx) => (
                    <div 
                      key={eIdx} 
                      className={`text-[10px] px-2 py-1 rounded-sm border truncate font-medium cursor-pointer transition-all hover:brightness-125 ${event.colorClass}`}
                      title={`${event.time} - ${event.title}`}
                    >
                      {event.time} • {event.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
