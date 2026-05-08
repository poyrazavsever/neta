"use client";

import { Plus, Search, Filter, Brain, FileText, Download, MoreHorizontal, FileSpreadsheet, FileIcon, MessageSquare } from "lucide-react";

// Mock Data
const documents = [
  {
    id: 1,
    name: "Q3 Strategy Planning.docx",
    type: "word",
    size: "2.4 MB",
    updated: "2 hours ago",
    aiStatus: "Summarized",
    aiSummary: "Focuses on user acquisition and shifting marketing budget to TikTok ads. AI extracted 4 key action items."
  },
  {
    id: 2,
    name: "Financial_Report_May.xlsx",
    type: "excel",
    size: "5.1 MB",
    updated: "Yesterday",
    aiStatus: "Analyzing",
    aiSummary: "AI is currently detecting anomalies in the Q2 vs Q3 expense margins."
  },
  {
    id: 3,
    name: "Design_System_Guidelines.pdf",
    type: "pdf",
    size: "12 MB",
    updated: "May 04, 2026",
    aiStatus: "Summarized",
    aiSummary: "Details the new dark mode color tokens (#0A0710). AI created a searchable index for developers."
  },
  {
    id: 4,
    name: "Client_Feedback_Transcript.txt",
    type: "text",
    size: "145 KB",
    updated: "May 01, 2026",
    aiStatus: "Action Required",
    aiSummary: "Sentiment analysis is extremely negative regarding the login flow. AI flagged this for urgent review."
  }
];

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Management</span> / Documents
        </h1>
        <div className="flex items-center gap-3">
          <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search documents or ask AI..." 
              className="bg-transparent border-none outline-none text-xs w-64 placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            UPLOAD
          </button>
        </div>
      </div>

      {/* AI Semantic Search Banner */}
      <div className="rounded-sm border border-primary/20 bg-[linear-gradient(90deg,rgba(108,91,176,0.1)_0%,rgba(10,7,16,0)_100%)] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">Talk to your Workspace</h2>
        </div>
        <p className="text-xs text-muted-foreground w-1/2 leading-relaxed">
          The AI has indexed 1,240 documents. Instead of searching by keywords, ask a direct question like <em>"What were the key takeaways from the Q3 Strategy?"</em>
        </p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ask anything about your files..." 
            className="flex-1 bg-[#0A0710] border border-white/10 rounded-sm px-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
          />
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-sm text-sm font-semibold transition-colors">
            Ask AI
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="rounded-sm border border-white/5 bg-[#0A0710] p-5 flex flex-col md:flex-row md:items-center gap-6 group hover:border-white/10 transition-colors">
            
            {/* File Info */}
            <div className="flex items-center gap-4 min-w-[300px]">
              <div className={`p-3 rounded-sm flex items-center justify-center shrink-0 ${
                doc.type === 'word' ? 'bg-blue-500/10 text-blue-400' :
                doc.type === 'excel' ? 'bg-emerald-500/10 text-emerald-400' :
                doc.type === 'pdf' ? 'bg-red-500/10 text-red-400' :
                'bg-white/10 text-foreground'
              }`}>
                {doc.type === 'word' ? <FileText className="h-6 w-6" /> :
                 doc.type === 'excel' ? <FileSpreadsheet className="h-6 w-6" /> :
                 <FileIcon className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold truncate hover:text-primary cursor-pointer transition-colors mb-1">{doc.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{doc.size}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span>{doc.updated}</span>
                </div>
              </div>
            </div>

            {/* AI Insight */}
            <div className="flex-1 flex flex-col bg-[#150F1D]/50 border border-white/5 p-3 rounded-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/50"></div>
              <div className="flex items-center gap-2 mb-1.5">
                <Brain className="h-3 w-3 text-primary" />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  doc.aiStatus === 'Action Required' ? 'text-red-400' :
                  doc.aiStatus === 'Analyzing' ? 'text-orange-400 animate-pulse' :
                  'text-primary'
                }`}>{doc.aiStatus}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {doc.aiSummary}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
                <MessageSquare className="h-3.5 w-3.5" />
                Chat
              </button>
              <button className="p-2 hover:bg-white/5 rounded-sm text-muted-foreground transition-colors">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-sm text-muted-foreground transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
