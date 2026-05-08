"use client";

import { useState } from "react";
import { 
  Plus, Search, MoreHorizontal, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, Layout, List, ArrowRight,
  TrendingUp, Users, Calendar, Activity, X, ChevronRight,
  Zap, Shield, Globe, Briefcase, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const projects = [
  { 
    id: 1, 
    name: "Marketing Site", 
    description: "Main landing page and marketing funnel optimizations for the Q3 campaign.", 
    progress: 75, 
    members: 4, 
    tasks: 24, 
    deadline: "May 25", 
    status: "Active", 
    health: "Good",
    phases: [
      { name: "Design", status: "Done", date: "Apr 15" },
      { name: "Development", status: "In Progress", date: "May 10" },
      { name: "QA", status: "Upcoming", date: "May 20" },
    ],
    aiRisk: "Low risk. Team velocity is 12% higher than average. Content approval is the only potential bottleneck."
  },
  { 
    id: 2, 
    name: "Infrastructure", 
    description: "Database and cloud server optimizations to support scaling to 100k users.", 
    progress: 45, 
    members: 2, 
    tasks: 12, 
    deadline: "Jun 10", 
    status: "Delayed", 
    health: "At Risk",
    phases: [
      { name: "Migration", status: "In Progress", date: "May 12" },
      { name: "Load Testing", status: "Upcoming", date: "May 25" },
      { name: "Live Deploy", status: "Upcoming", date: "Jun 05" },
    ],
    aiRisk: "High risk. Lead developer is over-allocated. Database migration scripts need optimization for the large dataset."
  },
  { id: 3, name: "Cognis Mobile", description: "React Native application for iOS/Android including push notifications.", progress: 92, members: 6, tasks: 48, deadline: "May 18", status: "Active", health: "Excell.", phases: [], aiRisk: "" },
  { id: 4, name: "Research", description: "User interview synthesis and competitor analysis for market expansion.", progress: 100, members: 3, tasks: 8, deadline: "May 05", status: "Completed", health: "Stable", phases: [], aiRisk: "" },
  { id: 5, name: "API v2", description: "Restructuring the core API for scale and performance improvements.", progress: 30, members: 5, tasks: 32, deadline: "Jul 15", status: "Active", health: "Good", phases: [], aiRisk: "" },
];

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
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
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-bold tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            NEW PROJECT
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <ProjectStatCard label="Active Projects" value="4" subtext="+1 from last month" icon={Activity} />
        <ProjectStatCard label="Average Progress" value="68%" subtext="12% ahead of schedule" icon={TrendingUp} />
        <ProjectStatCard label="Total Members" value="15" subtext="Across 5 project teams" icon={Users} />
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#150F1D] border border-white/5 rounded-sm p-0.5">
          <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-[#2B2538] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Layout className="h-3 w-3" /> Grid</button>
          <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-[#2B2538] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><List className="h-3 w-3" /> List</button>
        </div>
      </div>

      {/* Projects Container */}
      <div className="flex-1 overflow-y-auto tiny-scrollbar">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedProject(project)}
                className="bg-[#0A0710] border border-white/5 rounded-sm p-6 flex flex-col gap-6 relative group overflow-hidden shadow-2xl cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 opacity-10 blur-3xl rounded-full ${project.status === 'Delayed' ? 'bg-rose-500' : 'bg-primary'}`} />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black truncate group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                  </div>
                  <button className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-muted-foreground uppercase tracking-widest">Global Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : project.status === 'Delayed' ? 'bg-rose-500' : 'bg-primary shadow-[0_0_12px_rgba(108,91,176,0.6)]'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/5 rounded-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{project.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-5 w-5 rounded-full border border-[#0A0710] bg-[#1F172B] flex items-center justify-center text-[8px] font-bold">U{i}</div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground ml-1">{project.members} Team</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-sm border ${
                    project.health === 'Good' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' :
                    project.health === 'Excell.' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                    project.health === 'At Risk' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 'text-muted-foreground border-white/10'
                  }`}>
                    {project.health}
                  </span>
                  <button className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 text-primary group/btn">
                    VIEW DETAILS <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-[#0A0710] border border-white/5 rounded-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <div className="col-span-4">Project Name</div>
              <div className="col-span-2">Health Status</div>
              <div className="col-span-3">Progress Metrics</div>
              <div className="col-span-2">Final Deadline</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-white/5">
              {projects.map(project => (
                <div key={project.id} onClick={() => setSelectedProject(project)} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer">
                  <div className="col-span-4">
                    <div className="text-sm font-black group-hover:text-primary transition-colors">{project.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 tracking-wider">{project.tasks} Active Deliverables</div>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border ${
                      project.health === 'Good' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' :
                      project.health === 'Excell.' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-400 border-rose-500/20 bg-rose-500/5'
                    }`}>
                      {project.health}
                    </span>
                  </div>
                  <div className="col-span-3 pr-12">
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                      <span className="text-muted-foreground">{project.progress}% Complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${project.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase">{project.deadline}</div>
                  <div className="col-span-1 flex justify-end">
                    <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Detail Sheet */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col">
              
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border ${
                      selectedProject.health === 'Good' ? 'text-blue-400 border-blue-500/20' :
                      selectedProject.health === 'Excell.' ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20'
                    }`}>
                      {selectedProject.health} Health
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Due: {selectedProject.deadline}</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-foreground">{selectedProject.name}</h2>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-3 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 tiny-scrollbar">
                
                {/* Description & KPI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Overview</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedProject.description}</p>
                  </div>
                  <div className="bg-[#150F1D] border border-white/5 rounded-sm p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl font-black text-primary mb-1">{selectedProject.progress}%</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Progress</div>
                  </div>
                </div>

                {/* AI Risk Intelligence */}
                {selectedProject.aiRisk && (
                  <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 space-y-3 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                      <Brain className="h-20 w-20 text-primary" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5" /> AI Risk Assessment
                    </h3>
                    <p className="text-xs font-medium text-foreground/90 leading-relaxed italic">
                      "{selectedProject.aiRisk}"
                    </p>
                  </div>
                )}

                {/* Timeline / Phases */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Project Roadmap</h3>
                  <div className="relative space-y-8 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                    {selectedProject.phases?.map((phase: any, i: number) => (
                      <div key={i} className="relative group">
                        <div className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-[#0A0710] z-10 ${
                          phase.status === 'Done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                          phase.status === 'In Progress' ? 'bg-primary shadow-[0_0_8px_rgba(108,91,176,0.5)]' : 'bg-white/10'
                        }`} />
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold group-hover:text-primary transition-colors">{phase.name}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{phase.date} • {phase.status}</div>
                          </div>
                          {phase.status === 'Done' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team & Resources */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Team Allocation</h3>
                    <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground">MANAGE TEAM</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].slice(0, selectedProject.members).map(i => (
                      <div key={i} className="p-4 rounded-sm bg-[#150F1D] border border-white/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs">U{i}</div>
                        <div>
                          <div className="text-xs font-bold text-foreground">Project Member {i}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Strategic Lead</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-10 border-t border-white/5 bg-[#0F0B15]/50 flex gap-4">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-sm text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-[0.98]">
                  LAUNCH PROJECT CONSOLE
                </button>
                <button className="p-4 border border-white/10 rounded-sm text-muted-foreground hover:bg-white/5 transition-colors">
                  <Activity className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function ProjectStatCard({ label, value, subtext, icon: Icon }: any) {
  return (
    <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex items-center gap-6 group relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="h-20 w-20 text-foreground" />
      </div>
      <div className="p-4 bg-white/5 rounded-sm group-hover:bg-primary/10 transition-colors relative z-10">
        <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="relative z-10">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground tracking-tighter">{value}</span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{subtext}</span>
        </div>
      </div>
    </div>
  );
}
