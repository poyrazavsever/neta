"use client";

import { useState } from "react";
import { 
  Plus, Search, Filter, Brain, CheckSquare2, Clock, AlertCircle, 
  MoreHorizontal, MessageSquare, ArrowUpRight, CheckCircle2, 
  GripVertical, List, Layout, X, Calendar, User, Tag
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

// Mock Data
const initialTasks = [
  { id: "1", title: "Finalize Q3 Marketing Assets", project: "Marketing Site", priority: "High", status: "In Progress", assignee: "Sarah J.", aiPredict: "2 days", dueDate: "May 15" },
  { id: "2", title: "Database Migration Script", project: "Infrastructure", priority: "Critical", status: "Review", assignee: "Alex R.", aiPredict: "4 hours", dueDate: "May 12" },
  { id: "3", title: "Design System Tokens", project: "Cognis Mobile", priority: "Medium", status: "To Do", assignee: "Mike C.", aiPredict: "3 days", dueDate: "May 20" },
  { id: "4", title: "Client Interview Synthesis", project: "Research", priority: "Low", status: "Done", assignee: "Emma W.", aiPredict: "Completed", dueDate: "May 08" },
  { id: "5", title: "Optimize Webpack Config", project: "Infrastructure", priority: "Medium", status: "To Do", assignee: "Alex R.", aiPredict: "1 day", dueDate: "May 18" }
];

const columns = ["To Do", "In Progress", "Review", "Done"];

export default function TasksPage() {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [tasks, setTasks] = useState(initialTasks);
  const [isSorting, setIsSorting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const handleAutoSort = () => {
    setIsSorting(true);
    setTimeout(() => {
      const sorted = [...tasks].sort((a, b) => {
        const priorityOrder: any = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setTasks(sorted);
      setIsSorting(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Management</span> / Tasks
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            NEW TASK
          </button>
        </div>
      </div>

      {/* AI Task Prioritization Card */}
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12 transition-transform group-hover:scale-110">
          <Brain className="h-24 w-24 text-primary" />
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Priority Engine
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-2xl">
              Based on deadlines and team velocity, I've identified 3 tasks that need immediate focus. Auto-sort will reorder your backlog for maximum strategic impact.
            </p>
          </div>
        </div>
        <button 
          onClick={handleAutoSort}
          disabled={isSorting}
          className={`min-w-[140px] px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${isSorting ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'}`}
        >
          {isSorting ? "SORTING..." : "AUTO-SORT BACKLOG"}
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 bg-[#150F1D] border border-white/5 rounded-sm p-0.5">
          <button 
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-[#2B2538] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="h-3 w-3" /> List View
          </button>
          <button 
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-[#2B2538] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Layout className="h-3 w-3" /> Kanban Board
          </button>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {tasks.length} Active Tasks
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === "list" ? (
          <div className="bg-[#0A0710] rounded-sm border border-white/5 overflow-hidden flex flex-col h-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
              <div className="col-span-5">Task Details</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Assignee</div>
              <div className="col-span-2">AI Time Est.</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            <div className="flex-1 overflow-y-auto tiny-scrollbar">
              <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <Reorder.Item 
                    key={task.id} 
                    value={task} 
                    onClick={() => setSelectedTask(task)}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <div className="col-span-5 flex items-start gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground/30 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium mb-1 truncate ${task.status === 'Done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground font-bold bg-[#150F1D] px-2 py-0.5 rounded-sm border border-white/5">{task.project}</span>
                          <span className={`text-[10px] uppercase font-black tracking-widest flex items-center gap-1 ${task.priority === 'Critical' ? 'text-red-400' : task.priority === 'High' ? 'text-orange-400' : 'text-blue-400'}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-sm border inline-block tracking-widest ${task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : task.status === 'Review' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-sm bg-[#1F172B] border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                        {task.assignee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{task.assignee}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary opacity-50" />
                      <span className="text-xs text-muted-foreground">{task.aiPredict}</span>
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6 h-full overflow-x-auto pb-4 tiny-scrollbar">
            {columns.map((col) => (
              <div key={col} className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{col}</h3>
                  <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-sm">{tasks.filter(t => t.status === col).length}</span>
                </div>
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-sm p-3 space-y-3 overflow-y-auto tiny-scrollbar">
                  {tasks.filter(t => t.status === col).map(task => (
                    <motion.div 
                      key={task.id}
                      layoutId={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-[#0A0710] border border-white/5 rounded-sm p-4 hover:border-primary/30 transition-all cursor-pointer group shadow-xl"
                    >
                      <div className="text-xs font-bold mb-3 group-hover:text-primary transition-colors leading-relaxed">{task.title}</div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm border ${task.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                          {task.priority}
                        </span>
                        <div className="h-5 w-5 rounded-sm bg-[#1F172B] border border-white/10 flex items-center justify-center text-[8px] font-black text-primary">
                          {task.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button className="w-full py-2 border border-dashed border-white/10 rounded-sm text-[10px] font-bold text-muted-foreground hover:bg-white/5 hover:border-white/20 transition-all">
                    + ADD TASK
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Sheet */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTask(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#0F0B15]/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-sm">{selectedTask.project}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">ID: #TSK-{selectedTask.id}</span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight">{selectedTask.title}</h2>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-white/5 rounded-sm text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 tiny-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <DetailItem label="ASSIGNEE" icon={User} value={selectedTask.assignee} />
                  <DetailItem label="DUE DATE" icon={Calendar} value={selectedTask.dueDate} />
                  <DetailItem label="PRIORITY" icon={AlertCircle} value={selectedTask.priority} />
                  <DetailItem label="AI ESTIMATE" icon={Brain} value={selectedTask.aiPredict} color="text-primary" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This task is part of the strategic {selectedTask.project} roadmap. Please ensure all design tokens are verified against the core Cognis design system before final review.
                  </p>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Subtasks</h3>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-sm bg-[#150F1D] border border-white/5 hover:border-white/10 transition-colors">
                        <div className="w-4 h-4 rounded-sm border border-white/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <CheckSquare2 className="h-3 w-3 text-transparent hover:text-muted-foreground transition-colors" />
                        </div>
                        <span className="text-xs text-muted-foreground">Verification step {i} for the migration script.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-[#0F0B15]/50 flex gap-4">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-sm text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                  MARK AS DONE
                </button>
                <button className="p-3 border border-white/10 rounded-sm text-muted-foreground hover:bg-white/5 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function DetailItem({ label, icon: Icon, value, color = "text-muted-foreground" }: any) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{label}</div>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className={`text-sm font-bold ${color === 'text-primary' ? 'text-primary' : 'text-foreground'}`}>{value}</span>
      </div>
    </div>
  );
}
