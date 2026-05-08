"use client";

import { Plus, Search, Filter, Brain, AlertCircle, Clock, CheckCircle2, MoreHorizontal, Users, BarChart } from "lucide-react";

// Mock Data
const projects = [
  {
    id: 1,
    name: "Cognis Mobile App",
    status: "In Progress",
    progress: 65,
    dueDate: "May 28, 2026",
    team: ["JD", "AK", "LM"],
    aiRisk: "Low",
    aiSuggestion: "On track. Consistent velocity detected."
  },
  {
    id: 2,
    name: "Q3 Marketing Site",
    status: "At Risk",
    progress: 32,
    dueDate: "Jun 15, 2026",
    team: ["RK", "ST"],
    aiRisk: "High",
    aiSuggestion: "Bottleneck detected in Design phase. Suggest assigning 1 more designer."
  },
  {
    id: 3,
    name: "Database Migration",
    status: "Review",
    progress: 90,
    dueDate: "May 20, 2026",
    team: ["JS", "AL", "BQ", "MK"],
    aiRisk: "Medium",
    aiSuggestion: "QA testing is taking 20% longer than historical average."
  },
  {
    id: 4,
    name: "User Authentication V2",
    status: "To Do",
    progress: 0,
    dueDate: "Jul 01, 2026",
    team: ["AK", "LM"],
    aiRisk: "Low",
    aiSuggestion: "Dependencies cleared. Ready to start."
  }
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Management</span> / Projects
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-[#150F1D] hover:bg-white/5 text-foreground border border-white/10 px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            NEW PROJECT
          </button>
        </div>
      </div>

      {/* AI Project Manager Insight */}
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-sm">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
            AI Project Assistant
            <span className="bg-primary/20 text-primary text-[9px] uppercase px-1.5 py-0.5 rounded-sm">Active</span>
          </h3>
          <p className="text-xs text-foreground/80 leading-relaxed mb-3">
            I have analyzed your active projects. <strong>Q3 Marketing Site</strong> is showing a high risk of delay based on current commit velocity. 
            I recommend redistributing tasks or extending the deadline by 4 days.
          </p>
          <div className="flex gap-3">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-sm text-xs font-semibold transition-colors">
              Apply AI Reallocation
            </button>
            <button className="bg-transparent hover:bg-white/5 text-foreground border border-white/10 px-4 py-1.5 rounded-sm text-xs font-semibold transition-colors">
              View Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="rounded-sm border border-white/5 bg-[#0A0710] flex flex-col group">
            {/* Card Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-base font-semibold">{project.name}</h2>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border ${
                    project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    project.status === 'At Risk' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    project.status === 'Review' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    'bg-white/5 text-muted-foreground border-white/10'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Due {project.dueDate}</div>
                  <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {project.team.length} Members</div>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* AI Risk & Suggestion */}
            <div className="p-4 bg-[#150F1D]/50 border-b border-white/5 flex gap-3 items-start">
              {project.aiRisk === "High" ? <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" /> : 
               project.aiRisk === "Medium" ? <BarChart className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" /> : 
               <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <Brain className="h-3 w-3" />
                  AI Risk: <span className={
                    project.aiRisk === 'High' ? 'text-red-400' : 
                    project.aiRisk === 'Medium' ? 'text-orange-400' : 'text-emerald-400'
                  }>{project.aiRisk}</span>
                </div>
                <p className="text-xs text-muted-foreground">{project.aiSuggestion}</p>
              </div>
            </div>

            {/* Progress & Actions */}
            <div className="p-6 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Progress</span>
                <span className="text-xs font-bold text-primary">{project.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
