"use client";

import { useState } from "react";
import { 
  Plus, Search, Target, Flag, TrendingUp, Zap, 
  CheckCircle2, Clock, Brain, MoreHorizontal, X,
  ChevronRight, ArrowRight, BarChart3, Star,
  Shield, Globe, Briefcase, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const goals = [
  { 
    id: 1, 
    title: "100k Monthly Recurring Revenue", 
    category: "Financial", 
    progress: 42, 
    deadline: "Dec 2026", 
    status: "Active", 
    priority: "Critical",
    milestones: [
      { name: "Reach 50k MRR", status: "Done", date: "Aug 2026" },
      { name: "Scale Sales Team", status: "In Progress", date: "Sep 2026" },
      { name: "Launch Enterprise Tier", status: "Upcoming", date: "Nov 2026" },
    ],
    aiInsight: "Currently 12% ahead of target. Strategic focus should remain on enterprise lead generation."
  },
  { 
    id: 2, 
    title: "Launch Revanios AI Mobile App", 
    category: "Product", 
    progress: 85, 
    deadline: "May 25, 2026", 
    status: "Active", 
    priority: "High",
    milestones: [
      { name: "Beta Testing", status: "Done", date: "Apr 15" },
      { name: "App Store Review", status: "In Progress", date: "May 10" },
      { name: "Global Launch", status: "Upcoming", date: "May 25" },
    ],
    aiInsight: "85% complete. Recommendation: Finalize push notification logic to ensure day-1 retention."
  },
  { id: 3, title: "Achieve Peak Physical Fitness", category: "Personal", progress: 60, deadline: "Ongoing", status: "Active", priority: "Medium", milestones: [], aiInsight: "" },
  { id: 4, title: "Acquire 500 Enterprise Leads", category: "Marketing", progress: 25, deadline: "Jun 2026", status: "Delayed", priority: "High", milestones: [], aiInsight: "" },
];

export default function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Vision</span> / Strategic Goals
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-sm border border-primary/10">
            <Target className="h-3 w-3" /> 4 ACTIVE OBJECTIVES
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search goals..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-5 py-2 rounded-sm text-xs font-black tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95">
            <Plus className="h-4 w-4" />
            NEW GOAL
          </button>
        </div>
      </div>

      {/* Goal Matrix Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <GoalCategoryCard label="Critical" count={1} color="text-rose-500" icon={Zap} />
        <GoalCategoryCard label="High Priority" count={2} color="text-orange-500" icon={Star} />
        <GoalCategoryCard label="Medium" count={1} color="text-blue-500" icon={TrendingUp} />
        <GoalCategoryCard label="Completed" count={12} color="text-emerald-500" icon={CheckCircle2} />
      </div>

      {/* Main Goals Grid */}
      <div className="flex-1 overflow-y-auto tiny-scrollbar pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6">
          {goals.map((goal) => (
            <motion.div 
              key={goal.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedGoal(goal)}
              className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex flex-col gap-8 relative group overflow-hidden shadow-2xl cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 opacity-10 blur-3xl rounded-full ${goal.priority === 'Critical' ? 'bg-rose-500' : 'bg-primary'}`} />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                      goal.priority === 'Critical' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' :
                      goal.priority === 'High' ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' : 'text-blue-400 border-blue-500/20 bg-blue-500/5'
                    }`}>
                      {goal.priority}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{goal.category}</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors">{goal.title}</h3>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-sm transition-colors text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Progress</div>
                    <div className="text-3xl font-black text-foreground">{goal.progress}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Target Date</div>
                    <div className="text-xs font-bold text-foreground">{goal.deadline}</div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${goal.progress === 100 ? 'bg-emerald-500' : goal.status === 'Delayed' ? 'bg-rose-500' : 'bg-primary shadow-[0_0_15px_rgba(108,91,176,0.5)]'}`}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-6 w-6 rounded-full border border-[#0A0710] bg-[#1F172B] flex items-center justify-center text-[8px] font-bold">U{i}</div>)}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{goal.milestones?.length || 0} Milestones</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 group/btn">
                  VIEW STRATEGY <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Goal Detail Sheet */}
      <AnimatePresence>
        {selectedGoal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGoal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col">
              
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border ${
                      selectedGoal.priority === 'Critical' ? 'text-rose-400 border-rose-500/20' : 'text-primary border-primary/20'
                    }`}>
                      {selectedGoal.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category: {selectedGoal.category}</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-foreground">{selectedGoal.title}</h2>
                </div>
                <button onClick={() => setSelectedGoal(null)} className="p-3 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 tiny-scrollbar">
                
                {/* Progress Visual */}
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2 bg-[#150F1D] border border-white/5 rounded-sm p-8 flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Completion</div>
                      <div className="text-4xl font-black">{selectedGoal.progress}%</div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${selectedGoal.progress}%` }} />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-sm p-6 flex flex-col items-center justify-center text-center">
                    <Clock className="h-6 w-6 text-muted-foreground mb-2" />
                    <div className="text-lg font-black">{selectedGoal.deadline}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Target Date</div>
                  </div>
                </div>

                {/* AI Goal Intelligence */}
                {selectedGoal.aiInsight && (
                  <div className="rounded-sm border border-primary/20 bg-primary/5 p-8 space-y-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                      <Brain className="h-24 w-24 text-primary" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Brain className="h-4 w-4" /> Goal Intelligence Report
                    </h3>
                    <p className="text-sm font-medium text-foreground/90 leading-relaxed italic">
                      "{selectedGoal.aiInsight}"
                    </p>
                  </div>
                )}

                {/* Milestone Roadmap */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Milestone Roadmap</h3>
                  <div className="relative space-y-8 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                    {selectedGoal.milestones?.map((ms: any, i: number) => (
                      <div key={i} className="relative group">
                        <div className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-[#0A0710] z-10 ${
                          ms.status === 'Done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                          ms.status === 'In Progress' ? 'bg-primary shadow-[0_0_8px_rgba(108,91,176,0.5)]' : 'bg-white/10'
                        }`} />
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold group-hover:text-primary transition-colors">{ms.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{ms.date} • {ms.status}</div>
                          </div>
                          {ms.status === 'Done' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connect Resources */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Linked Deliverables</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-sm bg-[#150F1D] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-sm"><Briefcase className="h-4 w-4 text-blue-400" /></div>
                        <div>
                          <div className="text-xs font-bold">Project: Revanios App</div>
                          <div className="text-[9px] text-muted-foreground uppercase mt-1">Core Requirement</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-4 rounded-sm bg-[#150F1D] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-sm"><Award className="h-4 w-4 text-emerald-500" /></div>
                        <div>
                          <div className="text-xs font-bold">Achievement: Series A</div>
                          <div className="text-[9px] text-muted-foreground uppercase mt-1">Strategic Outcome</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-10 border-t border-white/5 bg-[#0F0B15]/50 flex gap-4">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-sm text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]">
                  UPDATE STRATEGIC PROGRESS
                </button>
                <button className="p-5 border border-white/10 rounded-sm text-muted-foreground hover:bg-white/5 transition-colors">
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

function GoalCategoryCard({ label, count, color, icon: Icon }: any) {
  return (
    <div className="bg-[#0A0710] border border-white/5 rounded-sm p-6 flex items-center justify-between group hover:border-white/10 transition-all shadow-xl">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-white/5 rounded-sm ${color} transition-colors group-hover:bg-white/10`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
          <div className="text-xl font-black">{count}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
    </div>
  );
}
