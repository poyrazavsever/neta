"use client";

import { Plus, Search, Filter, Brain, PenTool, Calendar, AlignLeft, Tag, Lock, Sparkles, Image as ImageIcon } from "lucide-react";

// Mock Data
const journalEntries = [
  {
    id: 1,
    title: "Breakthrough in System Design",
    preview: "Today we finally cracked the database architecture. By moving to a distributed model...",
    date: "Today, 10:45 AM",
    tags: ["Work", "Idea", "Win"],
    sentiment: "Positive"
  },
  {
    id: 2,
    title: "Feeling a bit overwhelmed",
    preview: "The Q3 deadlines are approaching fast. I need to make sure I'm prioritizing...",
    date: "Yesterday",
    tags: ["Mental Health", "Vent"],
    sentiment: "Anxious"
  },
  {
    id: 3,
    title: "Morning Routine Reflection",
    preview: "Woke up at 6 AM. Did 20 minutes of meditation. It really sets the tone for...",
    date: "May 06, 2026",
    tags: ["Habits", "Morning"],
    sentiment: "Calm"
  }
];

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Personal</span> / Daily Journal
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search memories..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            NEW ENTRY
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Left Panel: Entry List & AI */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* AI Sentiment Analysis */}
          <div className="rounded-sm border border-primary/20 bg-[linear-gradient(135deg,rgba(108,91,176,0.1)_0%,rgba(10,7,16,0)_100%)] p-5">
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" /> AI Reflection Insight
            </h3>
            <p className="text-[11px] text-foreground/80 leading-relaxed mb-3">
              Over the last 14 days, your entries tagged with <strong>"Work"</strong> show a 30% increase in stress vocabulary. However, entries after <strong>Morning Meditation</strong> are consistently highly positive.
            </p>
            <button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors w-full">
              Generate Weekly Summary
            </button>
          </div>

          {/* Entries List */}
          <div className="flex-1 rounded-sm border border-white/5 bg-[#0A0710] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Entries</span>
              <Filter className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            </div>
            <div className="flex-1 overflow-y-auto tiny-scrollbar p-2 space-y-1">
              {journalEntries.map((entry, idx) => (
                <div key={entry.id} className={`p-3 rounded-sm cursor-pointer transition-colors ${idx === 0 ? 'bg-[#1F172B] border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}>
                  <h4 className="text-sm font-semibold text-foreground mb-1 truncate">{entry.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                    {entry.preview}
                  </p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-primary font-medium">{entry.date}</span>
                    <span className="flex gap-1">
                      {entry.tags.map(tag => (
                        <span key={tag} className="bg-white/10 px-1.5 py-0.5 rounded-sm">{tag}</span>
                      ))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Editor Mock */}
        <div className="flex-1 rounded-sm border border-white/5 bg-[#0A0710] flex flex-col relative overflow-hidden group">
          
          {/* Editor Header */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0F0B15]/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Today, 10:45 AM</span>
              <span className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> 3 Tags</span>
              <span className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Private</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><AlignLeft className="h-4 w-4" /></button>
              <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><ImageIcon className="h-4 w-4" /></button>
              <button className="p-1.5 hover:bg-primary/20 bg-primary/10 rounded-sm text-primary transition-colors flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> <span className="text-[10px] font-bold">Ask AI</span>
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 p-8 md:px-12 md:py-10 overflow-y-auto tiny-scrollbar">
            <input 
              type="text" 
              value="Breakthrough in System Design"
              readOnly
              className="w-full bg-transparent border-none outline-none text-3xl font-bold text-foreground mb-6"
            />
            <div className="text-foreground/80 leading-loose space-y-6 text-sm">
              <p>
                Today we finally cracked the database architecture. By moving to a distributed model, we've essentially solved the latency issues we were seeing during peak load. It feels incredibly satisfying to see weeks of research finally click into place.
              </p>
              <p>
                I was discussing this with Alex earlier, and he pointed out that this structure directly mirrors the microservices split we planned for Q4. This means we are actually ahead of schedule!
              </p>
              <div className="pl-4 border-l-2 border-primary text-primary italic">
                AI Note: You've mentioned "latency issues" in 3 previous entries. Consider documenting this final solution in the Engineering Wiki for future reference.
              </div>
              <p>
                Gonna take the rest of the evening off to recharge. Need to keep this momentum going without burning out.
              </p>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
