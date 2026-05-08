"use client";

import { Plus, Brain, FileText, CheckCircle2, Clock, AlertCircle, Eye, PenTool } from "lucide-react";

// Mock Data
const columns = [
  {
    title: "Drafting",
    color: "text-muted-foreground",
    items: [
      { id: 1, client: "Stark Industries", title: "Enterprise Dashboard Redesign", value: "$18,500", date: "May 25", status: "Draft" }
    ]
  },
  {
    title: "In Review",
    color: "text-blue-400",
    items: [
      { id: 2, client: "Wayne Enterprises", title: "Mobile App V2 Contract", value: "$32,000", date: "May 10", status: "Review" }
    ]
  },
  {
    title: "Sent / Negotiating",
    color: "text-orange-400",
    items: [
      { id: 3, client: "Acme Corp", title: "Q3 Marketing Retainer", value: "$4,500/mo", date: "May 05", status: "Sent" },
      { id: 4, client: "Globex", title: "SEO Audit Proposal", value: "$2,800", date: "May 02", status: "Viewed 3x" }
    ]
  },
  {
    title: "Signed / Won",
    color: "text-emerald-400",
    items: [
      { id: 5, client: "Soylent Corp", title: "Brand Identity Guidelines", value: "$15,000", date: "Apr 28", status: "Signed" }
    ]
  }
];

export default function ProposalsPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Freelance</span> / Proposals & Contracts
        </h1>
        <div className="flex items-center gap-3">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            CREATE PROPOSAL
          </button>
        </div>
      </div>

      {/* AI Conversion Optimizer */}
      <div className="rounded-sm border border-primary/20 bg-[linear-gradient(90deg,rgba(108,91,176,0.1)_0%,rgba(10,7,16,0)_100%)] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Conversion Optimizer
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
              Globex has viewed the "SEO Audit Proposal" 3 times in the last 24 hours. AI indicates high intent. Additionally, historical data shows proposals sent with an <em>interactive pricing table</em> have an 85% higher win rate in your niche.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="bg-[#150F1D] text-foreground border border-white/10 px-4 py-2 rounded-sm text-xs font-semibold transition-colors">
            Follow up Globex
          </button>
          <button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-4 py-2 rounded-sm text-xs font-semibold transition-colors">
            Apply Interactive Table Template
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 flex-1 min-h-0 pb-6">
        {columns.map((col, idx) => (
          <div key={idx} className="flex flex-col bg-white/[0.01] rounded-sm border border-white/5 p-4 overflow-hidden">
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.title}</h3>
              <span className="text-[10px] font-bold bg-[#150F1D] px-2 py-0.5 rounded-sm border border-white/5">{col.items.length}</span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 overflow-y-auto tiny-scrollbar space-y-3">
              {col.items.map((item) => (
                <div key={item.id} className="bg-[#0A0710] border border-white/5 hover:border-primary/50 transition-colors rounded-sm p-4 cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.client}</span>
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">{item.title}</h4>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold">{item.value}</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] flex items-center gap-1 ${
                        item.status === 'Signed' ? 'text-emerald-400' :
                        item.status.includes('Viewed') ? 'text-orange-400' : 'text-muted-foreground'
                      }`}>
                        {item.status === 'Signed' ? <CheckCircle2 className="h-3 w-3" /> :
                         item.status.includes('Viewed') ? <Eye className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
