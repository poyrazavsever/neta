"use client";

import { Plus, Search, Filter, Brain, Building2, Mail, Phone, MoreHorizontal, ShieldCheck, AlertCircle, ArrowUpRight } from "lucide-react";

// Mock Data
const clients = [
  {
    id: 1,
    name: "Acme Corp",
    contact: "Alice Johnson",
    email: "alice@acme.co",
    status: "Active",
    ltv: "$45,000",
    activeProjects: 2,
    aiSentiment: "Excellent",
    aiInsight: "Client engagement is at an all-time high. AI suggests pitching the Q4 Marketing Retainer this week."
  },
  {
    id: 2,
    name: "Globex Industries",
    contact: "Mark Smith",
    email: "msmith@globex.com",
    status: "At Risk",
    ltv: "$12,500",
    activeProjects: 1,
    aiSentiment: "Frustrated",
    aiInsight: "Sentiment analysis on recent emails indicates frustration with turnaround times. Schedule a sync ASAP."
  },
  {
    id: 3,
    name: "Soylent Corp",
    contact: "John Doe",
    email: "john.d@soylent.net",
    status: "Onboarding",
    ltv: "$0",
    activeProjects: 1,
    aiSentiment: "Neutral",
    aiInsight: "Awaiting signed NDA. Send an automated reminder tomorrow at 10 AM."
  },
  {
    id: 4,
    name: "Initech",
    contact: "Bill Lumbergh",
    email: "bill@initech.com",
    status: "Active",
    ltv: "$110,000",
    activeProjects: 3,
    aiSentiment: "Good",
    aiInsight: "Consistent payment history. No immediate actions required."
  }
];

export default function ClientsCRMPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Freelance</span> / Clients CRM
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="bg-transparent border-none outline-none text-xs w-48 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            NEW CLIENT
          </button>
        </div>
      </div>

      {/* AI CRM Intelligence */}
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Client Intelligence
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
              You have a high probability (85%) of closing an upsell with <strong>Acme Corp</strong> this month. Their usage of the current product has doubled. Shall I draft a customized proposal highlighting scale benefits?
            </p>
          </div>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-sm text-xs font-semibold transition-colors shrink-0 shadow-lg shadow-primary/20">
          Draft Proposal Draft
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5">
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Total Active Clients</h4>
          <div className="text-3xl font-bold text-foreground">14</div>
        </div>
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5">
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Pipeline LTV</h4>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-foreground">$167k</div>
            <span className="text-xs text-emerald-500 font-medium mb-1.5 flex items-center"><ArrowUpRight className="h-3 w-3" /> +12%</span>
          </div>
        </div>
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-5">
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Average Client Health</h4>
          <div className="flex items-end gap-2">
            <div className="text-3xl font-bold text-emerald-400">92/100</div>
            <span className="text-xs text-muted-foreground font-medium mb-1.5">Excellent</span>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-[#0A0710] rounded-sm border border-white/5 overflow-hidden flex-1">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Client</div>
          <div className="col-span-2">Status / LTV</div>
          <div className="col-span-6">AI Relationship Insight</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {clients.map((client) => (
            <div key={client.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors group">
              
              {/* Client Details */}
              <div className="col-span-3 flex items-start gap-3">
                <div className="h-8 w-8 rounded-sm bg-[#1F172B] border border-white/10 flex items-center justify-center text-primary mt-0.5 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground hover:text-primary cursor-pointer transition-colors mb-0.5">
                    {client.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span>{client.contact}</span>
                  </div>
                </div>
              </div>

              {/* Status / LTV */}
              <div className="col-span-2 flex flex-col items-start gap-1">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border inline-block ${
                    client.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    client.status === 'At Risk' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {client.status}
                </span>
                <span className="text-xs font-semibold text-foreground pl-1">{client.ltv} <span className="text-[10px] text-muted-foreground font-normal">LTV</span></span>
              </div>

              {/* AI Insight */}
              <div className="col-span-6 flex items-start gap-3 bg-[#150F1D]/50 border border-white/5 p-2 rounded-sm relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${
                  client.aiSentiment === 'Excellent' || client.aiSentiment === 'Good' ? 'bg-emerald-500' :
                  client.aiSentiment === 'Frustrated' ? 'bg-red-500' : 'bg-orange-500'
                }`}></div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Brain className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Sentiment: <span className={
                        client.aiSentiment === 'Excellent' || client.aiSentiment === 'Good' ? 'text-emerald-400' :
                        client.aiSentiment === 'Frustrated' ? 'text-red-400' : 'text-orange-400'
                      }>{client.aiSentiment}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/70 leading-snug">
                    {client.aiInsight}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4" />
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
