"use client";

import { Plus, Filter, Brain, Check, X, Flame, Target, Trophy, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";

// Mock Data
const habits = [
  {
    id: 1,
    name: "Morning Meditation",
    category: "Mindfulness",
    streak: 12,
    goal: "Daily",
    color: "#6C5BB0", // Primary
    status: [true, true, true, false, true, true, false],
    trend: [40, 45, 30, 60, 50, 70, 85]
  },
  {
    id: 2,
    name: "Read 20 Pages",
    category: "Learning",
    streak: 4,
    goal: "Daily",
    color: "#10b981", // Emerald
    status: [false, true, true, true, true, false, false],
    trend: [20, 40, 50, 40, 60, 80, 75]
  },
  {
    id: 3,
    name: "Gym Workout",
    category: "Health",
    streak: 2,
    goal: "4x Week",
    color: "#f97316", // Orange
    status: [true, false, true, false, true, false, false],
    trend: [50, 55, 45, 65, 60, 75, 90]
  },
  {
    id: 4,
    name: "No Sugar",
    category: "Diet",
    streak: 0,
    goal: "Daily",
    color: "#ef4444", // Red
    status: [true, true, false, false, false, false, false],
    trend: [80, 70, 60, 40, 30, 20, 10]
  }
];

const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function HabitsPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Personal</span> / Habits Tracker
        </h1>
        <div className="flex items-center gap-3">
          <button className="bg-[#150F1D] hover:bg-white/5 text-foreground border border-white/10 px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            NEW HABIT
          </button>
        </div>
      </div>

      {/* AI Habit Optimizer */}
      <div className="rounded-sm border border-primary/20 bg-[linear-gradient(90deg,rgba(108,91,176,0.1)_0%,rgba(10,7,16,0)_100%)] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Habit Optimizer
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
              I noticed a pattern: You often break your <strong>"No Sugar"</strong> streak on Thursdays. This correlates with high-stress days marked in your Journal. AI suggests scheduling a stress-relief activity (like a walk) around 3 PM on Thursdays to curb cravings.
            </p>
          </div>
        </div>
        <button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-4 py-2 rounded-sm text-xs font-semibold transition-colors shrink-0">
          Add Routine Intervention
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Perfect Days This Month</h4>
            <div className="text-3xl font-bold text-foreground">8</div>
          </div>
          <Trophy className="h-10 w-10 text-emerald-500 opacity-20" />
        </div>
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Longest Active Streak</h4>
            <div className="text-3xl font-bold text-foreground">12 <span className="text-sm text-muted-foreground font-normal">days</span></div>
          </div>
          <Flame className="h-10 w-10 text-orange-500 opacity-20" />
        </div>
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Overall Completion Rate</h4>
            <div className="text-3xl font-bold text-foreground">68%</div>
          </div>
          <Target className="h-10 w-10 text-blue-500 opacity-20" />
        </div>
      </div>

      {/* Habit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {habits.map((habit) => (
          <div key={habit.id} className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col group hover:border-white/10 transition-colors relative overflow-hidden">
            
            {/* Top Info */}
            <div className="flex justify-between items-start mb-6 z-10">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">{habit.name}</h3>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm bg-white/5 text-muted-foreground border border-white/5">{habit.category}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Target className="h-3 w-3" /> {habit.goal}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground mb-0.5">Current Streak</span>
                <div className="flex items-center gap-1.5 font-bold" style={{ color: habit.streak > 0 ? habit.color : '#8F89A5' }}>
                  <Flame className="h-4 w-4" /> {habit.streak}
                </div>
              </div>
            </div>

            {/* Weekly Checkboxes */}
            <div className="flex justify-between items-center mb-6 z-10">
              {days.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">{day}</span>
                  <button 
                    className="w-8 h-8 rounded-sm flex items-center justify-center transition-all border"
                    style={{
                      backgroundColor: habit.status[idx] ? `${habit.color}20` : '#150F1D',
                      borderColor: habit.status[idx] ? `${habit.color}50` : '#ffffff10',
                      color: habit.status[idx] ? habit.color : '#ffffff20'
                    }}
                  >
                    {habit.status[idx] ? <Check className="h-4 w-4" /> : <X className="h-3 w-3" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Micro Chart (Background styling) */}
            <div className="h-16 w-full mt-auto relative z-0 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-0 left-0 text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> 30-Day Trend
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={habit.trend.map((val, i) => ({ name: i, value: val }))}>
                  <defs>
                    <linearGradient id={`grad-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={habit.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={habit.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ display: 'none' }} 
                  />
                  <Area type="monotone" dataKey="value" stroke={habit.color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${habit.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
