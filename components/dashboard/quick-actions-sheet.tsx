"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool, Target, CheckSquare2, Calendar, Coffee, Zap, Moon } from "lucide-react";

interface QuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickActionsSheet({ isOpen, onClose }: QuickActionsSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sheet Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
                <p className="text-sm text-muted-foreground">Add new entries to your workspace</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-sm transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action Grid */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Core Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: PenTool, label: "New Journal", color: "text-purple-400", bg: "bg-purple-500/10" },
                    { icon: Target, label: "Set Habit", color: "text-blue-400", bg: "bg-blue-500/10" },
                    { icon: CheckSquare2, label: "New Goal", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { icon: Calendar, label: "Schedule", color: "text-orange-400", bg: "bg-orange-500/10" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="flex flex-col items-center justify-center p-6 rounded-sm border border-white/5 bg-[#150F1D] hover:border-primary/50 transition-all group"
                    >
                      <div className={`p-3 rounded-full ${item.bg} ${item.color} mb-3 group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Quick Logs</h3>
                <div className="space-y-3">
                  {[
                    { icon: Coffee, label: "Log Coffee", value: "+1 Cup" },
                    { icon: Zap, label: "Energy Level", value: "8/10" },
                    { icon: Moon, label: "Sleep Quality", value: "Great" },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center justify-between p-4 rounded-sm border border-white/5 bg-[#150F1D] hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-primary">{item.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Sample */}
              <div className="pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Quick Task</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Task title..."
                      className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-4 py-3 text-sm outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-sm text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                    CREATE TASK
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-[#0F0B15]/50">
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                AI Assistant is ready to help with any of these actions
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
