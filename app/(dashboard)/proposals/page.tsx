"use client";

import { useState } from "react";
import { 
  Plus, Search, FileText, FileCheck, Clock, Shield, 
  MoreHorizontal, Download, Share2, Eye, Brain,
  ChevronRight, ArrowRight, X, CheckCircle2,
  AlertCircle, DollarSign, PenTool, Send, Layout, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const proposals = [
  { 
    id: 1, 
    title: "Enterprise AI Integration", 
    client: "Acme Corp", 
    value: "$42,000", 
    status: "Sent", 
    date: "May 15", 
    health: "Warm",
    aiInsight: "92% probability of closing based on recent meeting sentiment analysis.",
    details: "Full stack AI integration including LLM deployment and custom data pipelines."
  },
  { 
    id: 2, 
    title: "Cloud Infrastructure Audit", 
    client: "Global Tech", 
    value: "$12,500", 
    status: "Negotiation", 
    date: "May 12", 
    health: "Critical",
    aiInsight: "Client is questioning the pricing on Clause 4.2. Suggesting a 5% bundle discount.",
    details: "Security audit and scalability roadmap for the AWS infrastructure."
  },
  { id: 3, title: "Design System Revamp", client: "Nexus Design", value: "$8,200", status: "Signed", date: "May 08", health: "Secure", aiInsight: "", details: "" },
  { id: 4, title: "Mobile App Retainer", client: "Stark Ind.", value: "$5,000/mo", status: "Draft", date: "May 20", health: "Lead", aiInsight: "", details: "" },
];

export default function ProposalsPage() {
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Business</span> / Proposals & Contracts
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-sm border border-primary/10">
            <FileCheck className="h-3 w-3" /> 8 SIGNED CONTRACTS
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search proposals..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-5 py-2 rounded-sm text-xs font-black tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95">
            <Plus className="h-4 w-4" />
            NEW PROPOSAL
          </button>
        </div>
      </div>

      {/* Lifecycle Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <StatusCard label="Drafts" count={2} color="text-muted-foreground" icon={PenTool} />
        <StatusCard label="Out for Review" count={3} color="text-blue-500" icon={Send} />
        <StatusCard label="Negotiation" count={1} color="text-orange-500" icon={Clock} />
        <StatusCard label="Active Contracts" count={8} color="text-emerald-500" icon={Shield} />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 bg-[#150F1D] border border-white/5 rounded-sm p-0.5">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-[#2B2538] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><Layout className="h-3 w-3" /> Grid</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-[#2B2538] text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}><List className="h-3 w-3" /> List</button>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>Sort by: Latest</span>
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto tiny-scrollbar pr-1">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-6">
              {proposals.map((prop) => (
                <motion.div 
                  key={prop.id}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedProposal(prop)}
                  className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex flex-col gap-8 relative group overflow-hidden shadow-2xl cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 opacity-5 blur-3xl rounded-full ${prop.status === 'Signed' ? 'bg-emerald-500' : 'bg-primary'}`} />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                          prop.status === 'Signed' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                          prop.status === 'Negotiation' ? 'text-orange-400 border-orange-500/20 bg-orange-500/5' : 'text-blue-400 border-blue-500/20 bg-blue-500/5'
                        }`}>
                          {prop.status}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{prop.client}</span>
                      </div>
                      <h3 className="text-xl font-black tracking-tighter group-hover:text-primary transition-colors">{prop.title}</h3>
                    </div>
                    <FileText className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contract Value</div>
                    <div className="text-2xl font-black text-foreground">{prop.value}</div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Updated {prop.date}</span>
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${
                      prop.health === 'Secure' ? 'text-emerald-400' : prop.health === 'Critical' ? 'text-rose-400' : 'text-primary'
                    }`}>
                      {prop.health} PULSE
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0A0710] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
              <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                <div className="col-span-4 px-2">Document Title</div>
                <div className="col-span-2">Client</div>
                <div className="col-span-2">Lifecycle</div>
                <div className="col-span-2">Value</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-white/5">
                {proposals.map(prop => (
                  <div key={prop.id} onClick={() => setSelectedProposal(prop)} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-all group cursor-pointer">
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="h-8 w-8 rounded-sm bg-white/5 flex items-center justify-center"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                      <span className="text-sm font-black group-hover:text-primary transition-colors">{prop.title}</span>
                    </div>
                    <div className="col-span-2 text-xs font-bold text-muted-foreground uppercase">{prop.client}</div>
                    <div className="col-span-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border ${prop.status === 'Signed' ? 'text-emerald-400 border-emerald-500/20' : 'text-primary border-primary/20'}`}>
                        {prop.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm font-black text-foreground">{prop.value}</div>
                    <div className="col-span-2 flex justify-end opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Detail Sheet */}
      <AnimatePresence>
        {selectedProposal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProposal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col">
              
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 px-2 py-0.5 rounded-sm">{selectedProposal.status}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedProposal.client}</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-foreground">{selectedProposal.title}</h2>
                </div>
                <button onClick={() => setSelectedProposal(null)} className="p-3 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 tiny-scrollbar">
                
                {/* AI Closing Probability */}
                {selectedProposal.aiInsight && (
                  <div className="rounded-sm border border-primary/20 bg-primary/5 p-8 space-y-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5">
                      <Brain className="h-24 w-24 text-primary" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Brain className="h-4 w-4" /> AI Strategic Analysis
                    </h3>
                    <p className="text-sm font-medium text-foreground/90 leading-relaxed italic">
                      "{selectedProposal.aiInsight}"
                    </p>
                  </div>
                )}

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-[#150F1D] border border-white/5 rounded-sm p-6 space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">CONTRACT VALUE</div>
                    <div className="text-2xl font-black text-primary">{selectedProposal.value}</div>
                  </div>
                  <div className="bg-[#150F1D] border border-white/5 rounded-sm p-6 space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">RELATIONSHIP HEALTH</div>
                    <div className="text-2xl font-black text-foreground">{selectedProposal.health}</div>
                  </div>
                </div>

                {/* Lifecycle Roadmap */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Engagement History</h3>
                  <div className="relative space-y-8 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                    <HistoryItem title="Proposal Draft Created" date="May 10" status="Done" />
                    <HistoryItem title="Initial Review with Client" date="May 12" status="Done" />
                    <HistoryItem title="Current State: Negotiation" date="Now" status="Active" />
                    <HistoryItem title="Pending: Final Approval" date="TBD" status="Upcoming" />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Contractual Controls</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ControlBtn icon={Download} label="Export PDF" />
                    <ControlBtn icon={Share2} label="Secure Share" />
                    <ControlBtn icon={Eye} label="Client Preview" />
                    <ControlBtn icon={Shield} label="Verify Sig." />
                  </div>
                </div>

              </div>

              <div className="p-10 border-t border-white/5 bg-[#0F0B15]/50 flex gap-4">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-sm text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  <Send className="h-5 w-5" /> SEND REVISED PROPOSAL
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function HistoryItem({ title, date, status }: any) {
  return (
    <div className="relative group">
      <div className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-[#0A0710] z-10 ${
        status === 'Done' ? 'bg-emerald-500' : status === 'Active' ? 'bg-primary' : 'bg-white/10'
      }`} />
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-bold group-hover:text-primary transition-colors">{title}</div>
          <div className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{date}</div>
        </div>
      </div>
    </div>
  );
}

function ControlBtn({ icon: Icon, label }: any) {
  return (
    <button className="p-4 rounded-sm bg-[#150F1D] border border-white/5 flex items-center gap-3 group hover:border-primary/20 transition-all">
      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground">{label}</span>
    </button>
  );
}

function StatusCard({ label, count, color, icon: Icon }: any) {
  return (
    <div className="bg-[#0A0710] border border-white/5 rounded-sm p-6 flex items-center justify-between group hover:border-white/10 transition-all shadow-xl">
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-white/5 rounded-sm ${color} transition-colors group-hover:bg-white/10`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
          <div className="text-xl font-black">{count}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
    </div>
  );
}
