"use client";

import { Plus, Search, Filter, Brain, CheckSquare2, Clock, AlertCircle, MoreHorizontal, MessageSquare, ArrowUpRight, CheckCircle2 } from "lucide-react";

// Mock Data
const tasks = [
  {
    id: 1,
    title: "Finalize Q3 Marketing Assets",
    project: "Marketing Site",
    priority: "High",
    status: "In Progress",
    assignee: "Sarah J.",
    aiPredict: "2 days",
    dueDate: "May 15"
  },
  {
    id: 2,
    title: "Database Migration Script",
    project: "Infrastructure",
    priority: "Critical",
    status: "Review",
    assignee: "Alex R.",
    aiPredict: "4 hours",
    dueDate: "May 12"
  },
  {
    id: 3,
    title: "Design System Tokens",
    project: "Cognis Mobile",
    priority: "Medium",
    status: "To Do",
    assignee: "Mike C.",
    aiPredict: "3 days",
    dueDate: "May 20"
  },
  {
    id: 4,
    title: "Client Interview Synthesis",
    project: "Research",
    priority: "Low",
    status: "Done",
    assignee: "Emma W.",
    aiPredict: "Completed",
    dueDate: "May 08"
  },
  {
    id: 5,
    title: "Optimize Webpack Config",
    project: "Infrastructure",
    priority: "Medium",
    status: "To Do",
    assignee: "Alex R.",
    aiPredict: "1 day",
    dueDate: "May 18"
  }
];

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
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
          <button className="bg-[#150F1D] hover:bg-white/5 text-foreground border border-white/10 px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Filter className="h-4 w-4" />
            FILTER
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            NEW TASK
          </button>
        </div>
      </div>

      {/* AI Task Prioritization */}
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Task Prioritization
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-2xl">
              Based on the upcoming <strong>Infrastructure</strong> deadlines and <strong>Alex R.</strong>'s historical velocity, AI strongly suggests starting the <em>Database Migration Script</em> immediately. It has a high risk of cascading delays.
            </p>
          </div>
        </div>
        <button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-4 py-2 rounded-sm text-xs font-semibold transition-colors shrink-0">
          Auto-Sort Backlog
        </button>
      </div>

      {/* Task List Header */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-medium rounded-sm bg-[#2B2538] text-foreground shadow-sm">List View</button>
          <button className="px-3 py-1.5 text-xs font-medium rounded-sm text-muted-foreground hover:text-foreground transition-colors">Kanban Board</button>
        </div>
        <div className="text-xs text-muted-foreground font-medium">12 Active Tasks</div>
      </div>

      {/* Tasks Table */}
      <div className="bg-[#0A0710] rounded-sm border border-white/5 overflow-hidden flex-1">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-5">Task Details</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2">AI Time Estimate</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {tasks.map((task) => (
            <div key={task.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
              
              {/* Task Details */}
              <div className="col-span-5 flex items-start gap-3">
                <button className="mt-0.5 text-muted-foreground hover:text-primary transition-colors">
                  {task.status === "Done" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <CheckSquare2 className="h-4 w-4" />}
                </button>
                <div>
                  <div className={`text-sm font-medium mb-1 ${task.status === 'Done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium bg-[#150F1D] px-2 py-0.5 rounded-sm border border-white/5">
                      {task.project}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                      task.priority === 'Critical' ? 'text-red-400' :
                      task.priority === 'High' ? 'text-orange-400' :
                      task.priority === 'Medium' ? 'text-blue-400' : 'text-muted-foreground'
                    }`}>
                      {task.priority === 'Critical' && <AlertCircle className="h-3 w-3" />}
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm border inline-block ${
                    task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    task.status === 'Review' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-white/5 text-muted-foreground border-white/10'
                  }`}>
                    {task.status}
                </span>
              </div>

              {/* Assignee */}
              <div className="col-span-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded-sm bg-[#1F172B] border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {task.assignee.split(' ')[0][0]}{task.assignee.split(' ')[1][0]}
                </div>
                <span className="text-xs text-muted-foreground">{task.assignee}</span>
              </div>

              {/* AI Estimate */}
              <div className="col-span-2 flex items-center gap-2">
                {task.status !== 'Done' && <Clock className="h-3.5 w-3.5 text-primary" />}
                <span className={`text-xs ${task.status === 'Done' ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                  {task.aiPredict}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
