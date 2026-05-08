"use client";

import { Plus, Search, Filter, Brain, MoreVertical, Mail, Activity, ArrowUpRight } from "lucide-react";

// Mock Data
const teamMembers = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Lead Designer",
    capacity: 95,
    status: "Overloaded",
    aiInsight: "Sarah is operating at 95% capacity. AI suggests delaying non-critical UI reviews."
  },
  {
    id: 2,
    name: "Alex Rivera",
    role: "Frontend Engineer",
    capacity: 60,
    status: "Optimal",
    aiInsight: "Alex has high availability. Perfect candidate for the Q3 Marketing Site bottleneck."
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Backend Engineer",
    capacity: 85,
    status: "Busy",
    aiInsight: "Consistent high output. AI predicts 100% sprint completion."
  },
  {
    id: 4,
    name: "Emma Watson",
    role: "Product Manager",
    capacity: 75,
    status: "Optimal",
    aiInsight: "Meetings occupy 60% of Emma's time. AI recommends a no-meeting day on Thursdays."
  }
];

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Management</span> / Team Directory
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search team..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            INVITE MEMBER
          </button>
        </div>
      </div>

      {/* AI Team Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 lg:col-span-2 flex items-center gap-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              AI Team Optimizer
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed">
              Overall team velocity is up 14% this month. However, design resources are critically low. 
              <strong> Sarah Jenkins</strong> is at high risk of burnout. Would you like me to draft a capacity redistribution plan?
            </p>
            <button className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-sm text-xs font-semibold transition-colors">
              Generate Reallocation Plan
            </button>
          </div>
        </div>

        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Team Health Score</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-5xl font-bold text-emerald-400">8.4</span>
            <span className="text-xs text-emerald-500 flex items-center font-medium mb-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 0.3
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">Calculated by AI based on velocity and load</div>
        </div>
      </div>

      {/* Team Roster */}
      <div className="bg-[#0A0710] rounded-sm border border-white/5 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Member</div>
          <div className="col-span-3">Capacity / Status</div>
          <div className="col-span-4">AI Insight</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {teamMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
              {/* Member Info */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-sm bg-[#1F172B] border border-white/10 flex items-center justify-center font-bold text-primary">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
              </div>

              {/* Capacity */}
              <div className="col-span-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${member.capacity > 85 ? 'bg-red-500' : member.capacity > 65 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                      style={{ width: `${member.capacity}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold w-8 text-right">{member.capacity}%</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm border inline-block ${
                    member.status === 'Overloaded' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    member.status === 'Busy' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {member.status}
                </span>
              </div>

              {/* AI Insight */}
              <div className="col-span-4 flex items-start gap-2">
                <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {member.aiInsight}
                </p>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4" />
                </button>
                <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
