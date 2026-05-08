"use client";

import { useState } from "react";
import { 
  Plus, Search, Zap, Flame, Calendar, CheckCircle2, 
  Trophy, TrendingUp, Brain, Info, X, MoreHorizontal,
  ChevronRight, Activity, Clock, BarChart3, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const habits = [
  { id: 1, name: "Deep Work Block", frequency: "Daily", streak: 12, bestStreak: 24, progress: 85, color: "bg-[#6C5BB0]", icon: Brain, completedDays: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15] },
  { id: 2, name: "7AM Gym Session", frequency: "Mon, Wed, Fri", streak: 4, bestStreak: 8, progress: 60, color: "bg-emerald-500", icon: Activity, completedDays: [1, 3, 5, 8, 10, 12, 15] },
  { id: 3, name: "Strategic Reading", frequency: "Daily", streak: 0, bestStreak: 15, progress: 30, color: "bg-blue-500", icon: Zap, completedDays: [1, 2, 3, 4, 10, 11] },
  { id: 4, name: "Journaling", frequency: "Daily", streak: 18, bestStreak: 18, progress: 100, color: "bg-orange-500", icon: Target, completedDays: Array.from({length: 15}, (_, i) => i + 1) },
];

export default function HabitsPage() {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Mindset</span> / Habits & Performance
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/5 px-3 py-1 rounded-sm border border-orange-500/10">
            <Flame className="h-3 w-3" /> 18 DAY OVERALL STREAK
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search habits..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-5 py-2 rounded-sm text-xs font-black tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95">
            <Plus className="h-4 w-4" />
            NEW HABIT
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex items-center gap-6 group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Flame className="h-20 w-20 text-orange-500" /></div>
          <div className="p-4 bg-orange-500/10 rounded-sm"><Flame className="h-6 w-6 text-orange-500" /></div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Consistency Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tracking-tighter">92%</span>
              <span className="text-[10px] text-emerald-500 font-bold">+4% vs last week</span>
            </div>
          </div>
        </div>
        <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex items-center gap-6 group relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy className="h-20 w-20 text-primary" /></div>
          <div className="p-4 bg-primary/10 rounded-sm"><Trophy className="h-6 w-6 text-primary" /></div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Weekly Goals Hit</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tracking-tighter">14/18</span>
              <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Target: 16</span>
            </div>
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-sm p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 rotate-12"><Brain className="h-24 w-24 text-primary" /></div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Coach</h3>
          </div>
          <p className="text-xs font-bold leading-relaxed text-foreground/80 italic">
            "Your 'Strategic Reading' is slipping. Consider linking it to your 'Morning Coffee' habit to increase completion by ~40%."
          </p>
        </div>
      </div>

      {/* Main Habits Container */}
      <div className="flex-1 overflow-y-auto tiny-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-6">
          
          {/* Habits Cards */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Active Disciplines</h3>
              <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-2 uppercase tracking-widest"><Calendar className="h-3.5 w-3.5" /> Monthly View</button>
            </div>
            
            <div className="space-y-4">
              {habits.map(habit => (
                <motion.div 
                  key={habit.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedHabit(habit)}
                  className="bg-[#0A0710] border border-white/5 rounded-sm p-6 flex flex-col gap-6 relative group overflow-hidden shadow-xl cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-sm ${habit.color}/10 text-foreground`}>
                        <habit.icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black group-hover:text-primary transition-colors">{habit.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{habit.frequency}</span>
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          <div className="flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-widest">
                            <Flame className="h-3 w-3" /> {habit.streak} DAY STREAK
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Completion</div>
                        <div className="text-xl font-black">{habit.progress}%</div>
                      </div>
                      <button className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-sm shadow-xl shadow-primary/20 transition-all active:scale-90">
                        <CheckCircle2 className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Mini Heatmap Visualization */}
                  <div className="grid grid-cols-15 gap-1.5 h-3">
                    {Array.from({length: 15}).map((_, i) => {
                      const isCompleted = habit.completedDays.includes(i + 1);
                      return (
                        <div 
                          key={i} 
                          className={`rounded-[2px] transition-all ${isCompleted ? habit.color + ' opacity-100 shadow-[0_0_8px_rgba(108,91,176,0.3)]' : 'bg-white/5 opacity-30 hover:opacity-50'}`}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Detailed Performance Analytics */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">Strategic Insight</h3>
              <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest">Full Reports</button>
            </div>
            
            <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex flex-col gap-8 h-fit shadow-2xl">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Weekly Success Rate</h4>
                <div className="flex items-end justify-between h-40 gap-4">
                  {[45, 65, 30, 85, 95, 70, 80].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                      <div className="w-full relative">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`w-full rounded-sm bg-primary/20 border-t-2 border-primary group-hover/bar:bg-primary/40 transition-all cursor-pointer`}
                        />
                      </div>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest">Momentum Building</div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">You've maintained a 90%+ completion rate for 4 consecutive days. This is a 12% improvement over last week's performance.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest">Peak Performance Hub</div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">Deep Work completion correlates 85% with 7AM Gym sessions. Physical discipline is driving your strategic output.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Habit Detail Sheet */}
      <AnimatePresence>
        {selectedHabit && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedHabit(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col p-10 space-y-12">
              <div className="flex justify-between items-start">
                <div className={`p-5 rounded-sm ${selectedHabit.color}/20 text-foreground`}>
                  <selectedHabit.icon className="h-10 w-10" />
                </div>
                <button onClick={() => setSelectedHabit(null)} className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><X className="h-7 w-7" /></button>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter">{selectedHabit.name}</h2>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-lg font-black text-orange-500">{selectedHabit.streak} DAY STREAK</span>
                  </div>
                  <div className="text-xs font-black text-muted-foreground uppercase tracking-widest border-l border-white/10 pl-5">BEST STREAK: {selectedHabit.bestStreak} DAYS</div>
                </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-white/5">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">30-Day Activity Heatmap</h3>
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from({length: 30}).map((_, i) => {
                      const isCompleted = selectedHabit.completedDays.includes(i + 1);
                      return (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-sm border ${isCompleted ? selectedHabit.color + ' border-transparent shadow-[0_0_12px_rgba(108,91,176,0.2)]' : 'bg-white/5 border-white/5 opacity-20'}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-sm bg-[#150F1D] border border-white/5 space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">FREQUENCY</div>
                    <div className="text-sm font-black text-foreground">{selectedHabit.frequency}</div>
                  </div>
                  <div className="p-6 rounded-sm bg-[#150F1D] border border-white/5 space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MONTHLY SUCCESS</div>
                    <div className="text-sm font-black text-emerald-400">{selectedHabit.progress}%</div>
                  </div>
                </div>

                <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" /> Performance Context
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    You've hit this habit {selectedHabit.completedDays.length} times this month. Strategic data suggests that completing this before 10 AM increases your daily task throughput by 12%.
                  </p>
                </div>
              </div>

              <div className="mt-auto flex gap-4">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-sm text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]">
                  MARK AS COMPLETED TODAY
                </button>
                <button className="p-4 border border-white/10 rounded-sm text-muted-foreground hover:bg-white/5 transition-colors">
                  <BarChart3 className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
