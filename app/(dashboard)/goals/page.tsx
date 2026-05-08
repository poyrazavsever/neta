"use client";

import { Plus, Brain, Target, Compass, Award, MoreHorizontal, CircleDashed, CheckCircle2 } from "lucide-react";

// Mock Data
const goals = [
  {
    id: 1,
    title: "Launch SaaS Product MVP",
    category: "Career & Business",
    progress: 75,
    dueDate: "Q3 2026",
    status: "On Track",
    color: "#6C5BB0", // Primary
    milestones: [
      { name: "Finalize Designs", done: true },
      { name: "Backend Architecture", done: true },
      { name: "Frontend Development", done: true },
      { name: "Beta Testing", done: false },
      { name: "Public Launch", done: false },
    ]
  },
  {
    id: 2,
    title: "Run a Half-Marathon",
    category: "Health & Fitness",
    progress: 40,
    dueDate: "Oct 12, 2026",
    status: "Behind",
    color: "#10b981", // Emerald
    milestones: [
      { name: "Run 5K Without Stopping", done: true },
      { name: "Run 10K", done: true },
      { name: "Maintain 15K weekly volume", done: false },
      { name: "Complete 18K long run", done: false },
    ]
  },
  {
    id: 3,
    title: "Read 24 Books",
    category: "Personal Growth",
    progress: 50,
    dueDate: "Dec 31, 2026",
    status: "Ahead",
    color: "#f97316", // Orange
    milestones: [
      { name: "Read 6 Books (Q1)", done: true },
      { name: "Read 12 Books (Q2)", done: true },
      { name: "Read 18 Books (Q3)", done: false },
    ]
  }
];

export default function GoalsPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Personal</span> / Strategic Goals
        </h1>
        <div className="flex items-center gap-3">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            NEW GOAL
          </button>
        </div>
      </div>

      {/* AI Goal Strategist */}
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Goal Strategist
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
              You are falling behind on your <strong>Half-Marathon</strong> goal. Your running habit completion has dropped to 30% this month. AI suggests breaking the next milestone ("Maintain 15K weekly volume") into smaller, manageable 3K chunks to rebuild momentum.
            </p>
          </div>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-xs font-semibold transition-colors shrink-0 shadow-lg shadow-primary/20">
          Refactor Milestones
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-6 pb-6">
        {goals.map((goal) => (
          <div key={goal.id} className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col lg:flex-row gap-8 relative overflow-hidden group">
            
            {/* Left Side: Overview & Progress */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-foreground">{goal.title}</h2>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border ${
                    goal.status === 'Ahead' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    goal.status === 'Behind' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5"><Compass className="h-3.5 w-3.5" /> {goal.category}</span>
                  <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Due: {goal.dueDate}</span>
                </div>
              </div>

              {/* Big Progress Bar */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold">Overall Progress</span>
                  <span className="text-2xl font-bold" style={{ color: goal.color }}>{goal.progress}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 relative" 
                    style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                  >
                    {/* Inner highlight for 3D effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/20"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Milestones */}
            <div className="w-full lg:w-96 rounded-sm bg-[#150F1D] border border-white/5 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Milestones</h3>
                <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto tiny-scrollbar">
                {goal.milestones.map((ms, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {ms.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: goal.color }} />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${ms.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                      {ms.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 w-full border border-dashed border-white/10 hover:border-white/30 text-muted-foreground hover:text-foreground py-2 rounded-sm text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                <Plus className="h-3 w-3" /> Add Milestone
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
