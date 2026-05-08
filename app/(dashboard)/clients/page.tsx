"use client";

import { useState } from "react";
import { 
  Plus, Search, User, Mail, Phone, Globe, 
  MoreHorizontal, MessageSquare, Briefcase, 
  TrendingUp, Star, Clock, X, ChevronRight,
  ArrowUpRight, DollarSign, Brain, Shield,
  Activity, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const clients = [
  { 
    id: 1, 
    name: "Acme Corp", 
    contact: "John Doe", 
    email: "john@acme.com", 
    status: "Active", 
    value: "$12,400", 
    projects: 2, 
    health: "Stable",
    lastContact: "2 days ago",
    aiInsight: "Excellent relationship. High potential for upsell into the Q3 Marketing Package.",
    history: [
      { type: "Meeting", date: "May 12", note: "Q3 Strategy Review" },
      { type: "Payment", date: "May 08", note: "$4,200 received" },
    ]
  },
  { 
    id: 2, 
    name: "Global Tech", 
    contact: "Jane Smith", 
    email: "jane@global.io", 
    status: "Onboarding", 
    value: "$8,500", 
    projects: 1, 
    health: "Critical",
    lastContact: "1 week ago",
    aiInsight: "Risk of churn detected. Last communication was 7 days ago. Immediate outreach suggested.",
    history: [
      { type: "Proposal", date: "May 01", note: "Infrastructure Scale" },
    ]
  },
  { id: 3, name: "Nexus Design", contact: "Mike Ross", email: "mike@nexus.com", status: "Active", value: "$42,000", projects: 4, health: "Growth", lastContact: "Today", aiInsight: "Client is expanding rapidly. Consider offering a dedicated project manager role.", history: [] },
  { id: 4, name: "Stark Ind.", contact: "Pepper P.", email: "pepper@stark.com", status: "Lead", value: "$0", projects: 0, health: "Neutral", lastContact: "May 14", aiInsight: "Warm lead from the Webflow conference. Interested in AI integration.", history: [] },
];

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<any>(null);

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Network</span> / Strategic Clients
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-sm border border-primary/10">
            <Users className="h-3 w-3" /> 12 ACTIVE PARTNERSHIPS
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-5 py-2 rounded-sm text-xs font-black tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95">
            <Plus className="h-4 w-4" />
            ADD CLIENT
          </button>
        </div>
      </div>

      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <ClientStatCard label="Pipeline Value" value="$128.5k" subtext="+12% this month" icon={DollarSign} />
        <ClientStatCard label="Avg. Health" value="Stable" subtext="92% Retention" icon={Activity} />
        <ClientStatCard label="New Leads" value="15" subtext="8 Qualified" icon={TrendingUp} />
        <div className="bg-primary/5 border border-primary/20 rounded-sm p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 rotate-12 transition-transform group-hover:scale-110"><Brain className="h-20 w-20 text-primary" /></div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-2">
            <Brain className="h-3.5 w-3.5" /> AI Insight
          </div>
          <p className="text-[11px] font-bold text-foreground/80 leading-relaxed italic">
            "High churn risk for Global Tech. Immediate outreach suggested."
          </p>
        </div>
      </div>

      {/* Main Clients List */}
      <div className="flex-1 overflow-y-auto tiny-scrollbar pr-1">
        <div className="bg-[#0A0710] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            <div className="col-span-4 px-2">Partner Entity</div>
            <div className="col-span-2">Relationship</div>
            <div className="col-span-2">Strategic Value</div>
            <div className="col-span-2">Engagement</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {clients.map((client) => (
              <motion.div 
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-all group cursor-pointer border-l-2 border-transparent hover:border-primary"
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-sm bg-[#150F1D] border border-white/5 flex items-center justify-center font-black text-primary text-xs uppercase tracking-tighter shadow-inner">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black group-hover:text-primary transition-colors truncate">{client.name}</div>
                    <div className="text-[10px] text-muted-foreground font-bold tracking-widest mt-0.5">{client.contact}</div>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm border ${
                    client.health === 'Growth' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                    client.health === 'Stable' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' :
                    client.health === 'Critical' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 'text-muted-foreground border-white/10'
                  }`}>
                    {client.health}
                  </span>
                </div>

                <div className="col-span-2 flex flex-col">
                  <span className="text-sm font-black text-foreground">{client.value}</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{client.projects} Active Projects</span>
                </div>

                <div className="col-span-2 flex flex-col">
                  <span className="text-xs font-bold text-foreground">{client.lastContact}</span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Last Touchpoint</span>
                </div>

                <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><MessageSquare className="h-4 w-4" /></button>
                  <button className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Detail Sheet */}
      <AnimatePresence>
        {selectedClient && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedClient(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col">
              
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xl uppercase shadow-xl">
                    {selectedClient.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tighter text-foreground">{selectedClient.name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedClient.contact}</span>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{selectedClient.email}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-3 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><X className="h-6 w-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 tiny-scrollbar">
                
                {/* AI Client Pulse */}
                <div className="rounded-sm border border-primary/20 bg-primary/5 p-8 space-y-4 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-5">
                    <Brain className="h-24 w-24 text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Brain className="h-4 w-4" /> Client Health Pulse
                  </h3>
                  <p className="text-sm font-medium text-foreground/90 leading-relaxed italic">
                    "{selectedClient.aiInsight}"
                  </p>
                </div>

                {/* Key Financials */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-[#150F1D] border border-white/5 rounded-sm p-6 space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LIFETIME VALUE</div>
                    <div className="text-2xl font-black text-primary">{selectedClient.value}</div>
                  </div>
                  <div className="bg-[#150F1D] border border-white/5 rounded-sm p-6 space-y-2">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ACTIVE DELIVERABLES</div>
                    <div className="text-2xl font-black text-foreground">{selectedClient.projects}</div>
                  </div>
                </div>

                {/* Relationship History */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Relationship Log</h3>
                  <div className="relative space-y-6 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                    {selectedClient.history?.length > 0 ? selectedClient.history.map((log: any, i: number) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-[#0A0710] bg-primary z-10" />
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-bold group-hover:text-primary transition-colors">{log.note}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{log.date} • {log.type}</div>
                          </div>
                        </div>
                      </div>
                    )) : <p className="text-xs text-muted-foreground italic">No historical log entries found for this partner.</p>}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strategic Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ActionButton icon={Briefcase} label="Launch New Project" />
                    <ActionButton icon={DollarSign} label="Generate Invoice" />
                    <ActionButton icon={MessageSquare} label="Relationship Review" />
                    <ActionButton icon={Shield} label="Update Contract" />
                  </div>
                </div>

              </div>

              <div className="p-10 border-t border-white/5 bg-[#0F0B15]/50 flex gap-4">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-sm text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]">
                  OPEN PARTNER PORTAL
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function ActionButton({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="p-4 rounded-sm bg-[#150F1D] border border-white/5 flex items-center gap-3 group hover:border-primary/20 transition-all text-left">
      <div className="p-2 bg-white/5 rounded-sm group-hover:bg-primary/10 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
      </div>
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-tight group-hover:text-foreground">{label}</span>
    </button>
  );
}

function ClientStatCard({ label, value, subtext, icon: Icon }: any) {
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
          <span className="text-3xl font-black text-foreground tracking-tighter leading-none">{value}</span>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{subtext}</span>
        </div>
      </div>
    </div>
  );
}
