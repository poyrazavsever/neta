"use client";

import { useState } from "react";
import { 
  Plus, Search, Calendar, Clock, Brain, MessageSquare, 
  Smile, Frown, Meh, Star, MoreHorizontal, X, 
  Zap, Save, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon,
  ChevronLeft, ChevronRight, Activity, Filter, AlignLeft, Hash, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const journalEntries = [
  { 
    id: 1, 
    date: "May 15, 2026", 
    title: "Deep Work Breakthrough", 
    excerpt: "Today I finally cracked the multi-tenant architecture logic for the Cognis core. Energy was high after the morning focus block.", 
    sentiment: "Great", 
    moodScore: 92,
    tags: ["Productivity", "Coding"],
    content: "The morning started with a 4-hour deep work block. I avoided all notifications and focused purely on the database schema. The multi-tenant logic is now solid. I feel a huge weight off my shoulders. Physical energy was 9/10 thanks to the 7am gym session."
  },
  { 
    id: 2, 
    date: "May 14, 2026", 
    title: "Project Risk Discussion", 
    excerpt: "Met with Alex regarding the Infrastructure delays. Felt a bit anxious about the timeline but the AI risk report helped us focus.", 
    sentiment: "Neutral", 
    moodScore: 65,
    tags: ["Meeting", "Stress"],
    content: "Alex and I went through the infrastructure roadmap. We are indeed behind on the database migration. The stress is real, but we have a plan now. AI suggests prioritizing the migration scripts. Note for tomorrow: focus on script optimization."
  },
  { id: 3, date: "May 12, 2026", title: "Creative Flow", excerpt: "Spent the afternoon in Figma. The new 'Cyber-Lavender' palette is looking stunning in the dark mode previews.", sentiment: "Great", moodScore: 88, tags: ["Design", "Creative"] },
];

export default function JournalPage() {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Mindset</span> / Strategic Journal
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Edit3 className="h-3 w-3" /> 128 ENTRIES RECORDED
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search thoughts..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-5 py-2 rounded-sm text-xs font-black tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            NEW ENTRY
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* Left Sidebar: Entries List */}
        <div className="w-full max-w-sm flex flex-col gap-4 overflow-y-auto tiny-scrollbar pr-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent Reflections</h3>
            <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> FILTER
            </button>
          </div>
          
          <div className="space-y-4">
            {journalEntries.map(entry => (
              <motion.div 
                key={entry.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedEntry(entry)}
                className={`p-5 rounded-sm border cursor-pointer transition-all ${selectedEntry?.id === entry.id ? 'bg-[#1F172B] border-primary/40 shadow-xl' : 'bg-[#0A0710] border-white/5 hover:border-white/10'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{entry.date}</span>
                  <SentimentIcon sentiment={entry.sentiment} />
                </div>
                <h3 className={`text-sm font-black mb-2 transition-colors ${selectedEntry?.id === entry.id ? 'text-primary' : 'text-foreground'}`}>{entry.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 italic">"{entry.excerpt}"</p>
                <div className="flex gap-2 mt-4">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/5 text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content: Entry Viewer/Editor */}
        <div className="flex-1 bg-[#0A0710] border border-white/5 rounded-sm flex flex-col relative overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {selectedEntry ? (
              <motion.div 
                key={selectedEntry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col"
              >
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{selectedEntry.date}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400">
                        <Activity className="h-3 w-3" /> MOOD SCORE: {selectedEntry.moodScore}%
                      </div>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground">{selectedEntry.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2.5 hover:bg-white/5 rounded-sm text-muted-foreground transition-colors"><Edit3 className="h-5 w-5" /></button>
                    <button className="p-2.5 hover:bg-white/5 rounded-sm text-rose-500 transition-colors"><Trash2 className="h-5 w-5" /></button>
                  </div>
                </div>

                <div className="flex-1 p-10 overflow-y-auto tiny-scrollbar space-y-12">
                  
                  {/* AI Psychological Insight */}
                  <div className="rounded-sm border border-primary/20 bg-primary/5 p-8 space-y-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                      <Brain className="h-24 w-24 text-primary" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Brain className="h-4 w-4" /> Cognitive Analysis
                    </h3>
                    <p className="text-sm font-medium text-foreground/90 leading-relaxed italic">
                      "I've noticed that your mood scores peak when you mention 'Deep Work' blocks in the morning. However, meeting-heavy days seem to correlate with anxious sentiment. Consider restructuring 'Infrastructure' discussions for early PM."
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-6">
                    <p className="text-lg text-foreground/90 leading-[1.8] font-medium tracking-tight">
                      {selectedEntry.content || "No detailed content available for this entry."}
                    </p>
                  </div>

                  {/* Strategic Connections */}
                  <div className="pt-10 border-t border-white/5 space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Connected Strategics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-sm bg-[#150F1D] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-sm"><Zap className="h-4 w-4 text-primary" /></div>
                          <div>
                            <div className="text-xs font-bold text-foreground">Goal: Scaling Backend</div>
                            <div className="text-[9px] text-muted-foreground uppercase mt-1">Directly Referenced</div>
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all" />
                      </div>
                      <div className="p-4 rounded-sm bg-[#150F1D] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-sm"><Clock className="h-4 w-4 text-emerald-500" /></div>
                          <div>
                            <div className="text-xs font-bold text-foreground">Habit: 7AM Gym</div>
                            <div className="text-[9px] text-muted-foreground uppercase mt-1">Impact Observed</div>
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-[#0F0B15]/40 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0A0710] bg-[#1F172B] flex items-center justify-center text-[10px] font-bold">A{i}</div>)}
                    <div className="h-8 w-8 rounded-full border-2 border-[#0A0710] bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">+2</div>
                  </div>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:bg-primary/10 px-4 py-2 rounded-sm transition-all">
                    <MessageSquare className="h-4 w-4" /> 12 COMMENTS
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="p-6 bg-white/5 rounded-full">
                  <AlignLeft className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">No Entry Selected</h2>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto italic">Select a reflection from the sidebar or create a new strategic entry to begin.</p>
                </div>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-sm text-xs font-black tracking-widest uppercase hover:bg-primary/20 transition-all"
                >
                  Create Your First Entry
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {isCreating && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100]" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="fixed inset-0 m-auto w-full max-w-4xl h-[85vh] bg-[#0A0710] border border-white/10 z-[101] shadow-2xl flex flex-col rounded-sm overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-primary/10">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary rounded-sm shadow-xl shadow-primary/20"><Edit3 className="h-5 w-5 text-primary-foreground" /></div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">New Reflection</h2>
                    <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Documenting Strategic Growth</p>
                  </div>
                </div>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><X className="h-7 w-7" /></button>
              </div>

              <div className="flex-1 flex flex-col p-10 space-y-8 overflow-y-auto tiny-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Title of Reflection</label>
                  <input type="text" placeholder="e.g., Q3 Breakthrough or Team Alignment thoughts..." className="w-full bg-transparent border-none text-3xl font-black placeholder:text-muted-foreground/20 outline-none" />
                </div>

                <div className="flex gap-6 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-sm border border-white/5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold">May 15, 2026</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sentiment:</span>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-sm bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-500 transition-all"><Smile className="h-5 w-5" /></button>
                      <button className="p-2 rounded-sm bg-white/5 hover:bg-primary/20 hover:text-primary transition-all"><Meh className="h-5 w-5" /></button>
                      <button className="p-2 rounded-sm bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 transition-all"><Frown className="h-5 w-5" /></button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-[300px]">
                  <textarea 
                    placeholder="Write your strategic reflections here... Use # to link goals or tasks."
                    className="w-full h-full bg-transparent border-none outline-none text-lg leading-relaxed text-foreground/80 resize-none placeholder:text-muted-foreground/10 font-medium"
                  />
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><ImageIcon className="h-5 w-5" /></button>
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><LinkIcon className="h-5 w-5" /></button>
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Hash className="h-5 w-5" /></button>
                  <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                    <Clock className="h-3 w-3" /> Auto-saving to Cloud...
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-white/5 flex gap-6 bg-[#0F0B15]/60">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-sm text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  <Save className="h-5 w-5" /> PUBLISH REFLECTION
                </button>
                <button onClick={() => setIsCreating(false)} className="px-10 border border-white/10 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/5 transition-all">
                  DISCARD
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function SentimentIcon({ sentiment }: { sentiment: string }) {
  if (sentiment === "Great") return <Smile className="h-4 w-4 text-emerald-500" />;
  if (sentiment === "Neutral") return <Meh className="h-4 w-4 text-primary" />;
  return <Frown className="h-4 w-4 text-rose-500" />;
}
