"use client";

import { useState } from "react";
import { 
  Plus, Search, FileText, File, Image, Music, Video, 
  MoreHorizontal, Download, Share2, Trash2, Eye, 
  Layout, List, Brain, Clock, ChevronRight, X,
  Folder, HardDrive, Shield, Cloud, Tag, Info,
  Star, Filter, Zap, Globe, ExternalLink, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const documents = [
  { 
    id: 1, 
    name: "Marketing Strategy 2026.pdf", 
    type: "PDF", 
    size: "2.4 MB", 
    date: "May 10, 2026", 
    category: "Strategy", 
    starred: true,
    summary: "Comprehensive roadmap for Q3 marketing funnels and ad spend allocation.",
    owner: "Sarah J.",
    tags: ["Marketing", "Strategy", "Q3"],
    aiAnalysis: "This document outlines a 15% increase in digital spend. Key focus is on video-first content."
  },
  { 
    id: 2, 
    name: "Project Brand Identity.fig", 
    type: "FIG", 
    size: "15.8 MB", 
    date: "May 08, 2026", 
    category: "Design", 
    starred: false,
    summary: "Core design tokens, typography, and color palette for the Neta rebrand.",
    owner: "Alex R.",
    tags: ["Design", "UI", "Branding"],
    aiAnalysis: "Identifies 'Cyber-Lavender' as the primary action color. Typography is set to Geist Sans."
  },
  { id: 3, name: "Client Contracts Bundle.zip", type: "ZIP", size: "4.2 MB", date: "May 05, 2026", category: "Legal", starred: true, summary: "Collection of signed service agreements for the top 5 enterprise clients.", owner: "Emma W.", tags: ["Legal", "Enterprise"] },
  { id: 4, name: "Revenue Forecast Q3.xlsx", type: "XLSX", size: "1.1 MB", date: "May 01, 2026", category: "Finance", starred: false, summary: "Predicted revenue growth based on current subscription trends and churn rates.", owner: "Sarah J.", tags: ["Finance", "Data"] },
  { id: 5, name: "User Research Session 01.mp4", type: "MP4", size: "142 MB", date: "Apr 28, 2026", category: "Research", starred: false, summary: "Interview with primary persona 'Executive Alex' regarding workflow pain points.", owner: "Mike C.", tags: ["Research", "User-Test"] },
];

const storageStats = [
  { label: "Documents", size: "1.2 GB", color: "bg-primary", percentage: 65 },
  { label: "Media", size: "800 MB", color: "bg-blue-500", percentage: 25 },
  { label: "Others", size: "400 MB", color: "bg-white/20", percentage: 10 },
];

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [activeFolder, setActiveFolder] = useState("All Files");

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Resources</span> / Documents & Drive
          </h1>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-[#0A0710] bg-[#1F172B] flex items-center justify-center text-[8px] font-bold">U{i}</div>)}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Shared with team</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground font-medium"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-5 py-2 rounded-sm text-xs font-black tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95">
            <Plus className="h-4 w-4" />
            UPLOAD FILE
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* Left Sidebar: Navigation & Storage */}
        <div className="hidden xl:flex w-72 flex-col gap-8 shrink-0">
          
          <div className="space-y-1">
            {["All Files", "Recent", "Starred", "Shared", "Trash"].map(folder => (
              <button 
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-sm text-sm font-bold transition-all border ${activeFolder === folder ? 'bg-primary/5 text-primary border-primary/20 shadow-lg shadow-primary/5' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <Folder className={`h-4 w-4 ${activeFolder === folder ? 'text-primary' : 'text-muted-foreground'}`} />
                  {folder}
                </div>
                {folder === "Starred" && <Star className="h-3 w-3 fill-primary text-primary" />}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Storage Usage</h3>
            <div className="bg-[#0A0710] border border-white/5 rounded-sm p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">2.4 GB / 10 GB</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">24%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                {storageStats.map(stat => (
                  <div key={stat.label} className={`h-full ${stat.color}`} style={{ width: `${stat.percentage}%` }} />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 pt-2">
                {storageStats.map(stat => (
                  <div key={stat.label} className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`} />
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                    <span>{stat.size}</span>
                  </div>
                ))}
              </div>
              <button className="w-full bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest py-2 rounded-sm border border-white/5 transition-all mt-2">
                UPGRADE STORAGE
              </button>
            </div>
          </div>

          <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 space-y-4 relative overflow-hidden group shadow-2xl">
            <div className="absolute -right-4 -top-4 opacity-5 rotate-12 transition-transform group-hover:scale-110">
              <Brain className="h-20 w-20 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Librarian</h3>
            </div>
            <p className="text-[11px] font-bold text-foreground/80 leading-relaxed italic">
              "Your 'Legal' folder is 80% redundant. Should I suggest an automated cleanup strategy?"
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-[#150F1D] border border-white/5 rounded-sm p-0.5 shadow-inner">
                <button onClick={() => setViewMode("grid")} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-[#2B2538] text-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}><Layout className="h-3.5 w-3.5" /> Grid</button>
                <button onClick={() => setViewMode("list")} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-[#2B2538] text-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}><List className="h-3.5 w-3.5" /> List</button>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div className="flex items-center gap-4">
                {["All", "PDF", "Design", "Media"].map(f => (
                  <button key={f} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">{f}</button>
                ))}
              </div>
            </div>
            <button className="p-2.5 bg-[#150F1D] border border-white/5 rounded-sm text-muted-foreground hover:text-foreground transition-all">
              <Filter className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto tiny-scrollbar pr-1">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-8">
                {documents.map((doc) => (
                  <motion.div 
                    key={doc.id}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onClick={() => setSelectedDoc(doc)}
                    className="bg-[#0A0710] border border-white/5 rounded-sm p-6 flex flex-col group relative overflow-hidden shadow-2xl transition-all hover:border-primary/40 cursor-pointer"
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-1.5 hover:bg-white/10 rounded-sm transition-colors text-muted-foreground"><Star className={`h-3.5 w-3.5 ${doc.starred ? 'fill-primary text-primary' : ''}`} /></button>
                      <button className="p-1.5 hover:bg-white/10 rounded-sm transition-colors text-muted-foreground"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                    </div>
                    
                    <div className="aspect-[4/3] bg-[#150F1D] border border-white/5 rounded-sm mb-6 flex items-center justify-center relative overflow-hidden group/thumb shadow-inner">
                      <DocIcon type={doc.type} />
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[13px] font-black truncate group-hover:text-primary transition-colors tracking-tight">{doc.name}</div>
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-white/20" />
                          {doc.type} • {doc.size}
                        </span>
                        <span>{doc.date.split(',')[0]}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0A0710] border border-white/5 rounded-sm overflow-hidden shadow-2xl mb-8">
                <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 bg-[#0F0B15]/50 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  <div className="col-span-6 px-2">Document Name</div>
                  <div className="col-span-2">File Weight</div>
                  <div className="col-span-2">Ownership</div>
                  <div className="col-span-2 text-right">Strategic Date</div>
                </div>
                <div className="divide-y divide-white/5">
                  {documents.map(doc => (
                    <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-all group cursor-pointer border-l-2 border-transparent hover:border-primary">
                      <div className="col-span-6 flex items-center gap-5">
                        <DocIcon type={doc.type} small />
                        <div className="min-w-0">
                          <div className="text-[13px] font-black group-hover:text-primary transition-colors truncate tracking-tight">{doc.name}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">{doc.category}</span>
                            {doc.starred && <Star className="h-2.5 w-2.5 fill-primary text-primary" />}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-[11px] text-muted-foreground font-black uppercase tracking-tighter">{doc.size}</div>
                      <div className="col-span-2 text-[11px] text-muted-foreground font-black uppercase tracking-widest">{doc.owner}</div>
                      <div className="col-span-2 text-right text-[11px] text-muted-foreground font-black uppercase tracking-tighter">{doc.date.split(',')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Detail Sheet */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoc(null)} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0A0710] border-l border-white/10 z-[101] shadow-2xl flex flex-col">
              
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_-20%,rgba(108,91,176,0.15),transparent)] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-4 bg-[#150F1D] border border-white/10 rounded-sm shadow-xl">
                    <DocIcon type={selectedDoc.type} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter text-foreground truncate max-w-sm uppercase">{selectedDoc.name}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-primary/20 text-primary px-3 py-1 rounded-sm border border-primary/20 shadow-sm">{selectedDoc.type}</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{selectedDoc.size}</span>
                      {selectedDoc.starred && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-2.5 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors relative z-10"><X className="h-8 w-8" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 tiny-scrollbar relative">
                
                {/* AI Summary Section */}
                <div className="rounded-sm border border-primary/30 bg-primary/5 p-8 space-y-5 relative overflow-hidden shadow-2xl">
                  <div className="absolute -right-6 -top-6 opacity-10 rotate-12">
                    <Brain className="h-24 w-24 text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Brain className="h-4 w-4" /> Strategic Content Intelligence
                  </h3>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-foreground/90 leading-[1.6] italic tracking-tight">
                      "{selectedDoc.summary}"
                    </p>
                    {selectedDoc.aiAnalysis && (
                      <div className="pt-5 border-t border-primary/20 mt-5">
                        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5" /> High-Level Insight
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">{selectedDoc.aiAnalysis}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">File Properties</h3>
                    <div className="space-y-5">
                      <MetaItem label="AUTHOR" value={selectedDoc.owner} />
                      <MetaItem label="TIMELINE" value={selectedDoc.date} />
                      <MetaItem label="CLASSIF." value={selectedDoc.category} />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Tags</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedDoc.tags?.map((tag: string) => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm bg-white/5 border border-white/10 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer">
                          {tag}
                        </span>
                      ))}
                      <button className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border border-dashed border-white/20 text-muted-foreground hover:border-white/40 transition-colors">
                        + NEW TAG
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connected Ecosystem */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Ecosystem</h3>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Linked by AI</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 rounded-sm bg-[#150F1D] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-sm shadow-inner"><Globe className="h-5 w-5 text-primary" /></div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-foreground">Project: Q3 Expansion</div>
                          <div className="text-[9px] text-muted-foreground uppercase mt-1 font-bold">Referenced in Section 4.2</div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-5 rounded-sm bg-[#150F1D] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-sm shadow-inner"><Activity className="h-5 w-5 text-emerald-500" /></div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-foreground">Goal: Market Dominance</div>
                          <div className="text-[9px] text-muted-foreground uppercase mt-1 font-bold">Foundational Resource</div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-10 border-t border-white/10 bg-[#0F0B15]/60 flex gap-6">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-sm text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  <Download className="h-5 w-5" /> DOWNLOAD FILE
                </button>
                <button className="p-5 border border-white/10 rounded-sm text-muted-foreground hover:bg-white/10 transition-all shadow-xl">
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function DocIcon({ type, small = false }: { type: string, small?: boolean }) {
  const sizeClass = small ? "h-6 w-6" : "h-14 w-14";
  if (["PDF", "XLSX"].includes(type)) return <FileText className={`${sizeClass} text-rose-500`} />;
  if (["FIG"].includes(type)) return <File className={`${sizeClass} text-purple-500`} />;
  if (["MP4"].includes(type)) return <Video className={`${sizeClass} text-blue-500`} />;
  if (["ZIP"].includes(type)) return <File className={`${sizeClass} text-orange-500`} />;
  return <File className={`${sizeClass} text-muted-foreground`} />;
}

function MetaItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
      <span className="text-[11px] font-black text-foreground uppercase tracking-tight">{value}</span>
    </div>
  );
}
