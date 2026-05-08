"use client";

import { useState, useMemo } from "react";
import { 
  Plus, Search, TrendingUp, TrendingDown, DollarSign, 
  CreditCard, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Calendar, FileText, Download, PieChart as PieChartIcon, 
  Wallet, Brain, ArrowRight, X, Check, Activity,
  Briefcase, Landmark, Receipt, Percent, Target
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, 
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
  Pie, PieChart
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data
const cashflowData = [
  { month: "Jan", income: 12500, expense: 8400, predicted: 13000 },
  { month: "Feb", income: 14200, expense: 9100, predicted: 14500 },
  { month: "Mar", income: 13800, expense: 8800, predicted: 14000 },
  { month: "Apr", income: 15600, expense: 10200, predicted: 16000 },
  { month: "May", income: 18400, expense: 11500, predicted: 19500 },
  { month: "Jun", income: 21000, expense: 12000, predicted: 22000 },
];

const expensesByCategory = [
  { name: "Software", value: 3400, color: "#6C5BB0" },
  { name: "Rent", value: 2500, color: "#a798e8" },
  { name: "Marketing", value: 1800, color: "#10b981" },
  { name: "Taxes", value: 4200, color: "#3b82f6" },
  { name: "Travel", value: 1200, color: "#f59e0b" },
];

const transactions = [
  { id: 1, name: "Stripe Subscription", date: "May 15", amount: "+$4,200", status: "Success", type: "Income", category: "Direct Sales", project: "Cognis Mobile" },
  { id: 2, name: "Amazon Web Services", date: "May 12", amount: "-$840", status: "Pending", type: "Expense", category: "Cloud Infra", project: "Infrastructure" },
  { id: 3, name: "Office Rent Q3", date: "May 10", amount: "-$2,500", status: "Success", type: "Expense", category: "Overhead", project: "General" },
  { id: 4, name: "Client: Marketing Site", date: "May 08", amount: "+$2,800", status: "Success", type: "Income", category: "Freelance", project: "Marketing Site" },
  { id: 5, name: "GitHub Enterprise", date: "May 05", amount: "-$120", status: "Success", type: "Expense", category: "Software", project: "Infrastructure" },
];

export default function FinancePage() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6 pb-12 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-muted-foreground">
            <span className="text-foreground">Business</span> / Financials
          </h1>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-sm border border-emerald-500/10">
            <Check className="h-3 w-3" /> ALL SYSTEMS HEALTHY
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowInvoiceModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-5 py-2 rounded-sm text-xs font-black tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/30 active:scale-95"
          >
            <Receipt className="h-4 w-4" />
            CREATE INVOICE
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <FinanceKpiCard label="Total Revenue" value="$42,850" change="+18%" trend="up" icon={DollarSign} />
        <FinanceKpiCard label="Tax Provision" value="$8,400" change="+12%" trend="up" icon={Landmark} />
        <FinanceKpiCard label="Operating Costs" value="$12,400" change="-5%" trend="down" icon={TrendingDown} />
        <FinanceKpiCard label="Projected Net" value="$30,450" change="+24%" trend="up" icon={Wallet} color="primary" />
      </div>

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Cashflow Chart */}
        <div className="xl:col-span-2 bg-[#0A0710] border border-white/5 rounded-sm p-8 flex flex-col relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-48 w-48 text-primary" />
          </div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black mb-1 flex items-center gap-3">
                Intelligent Cashflow
                <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-sm uppercase tracking-[0.2em] animate-pulse">AI Forecasting</span>
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">Real-time revenue monitoring compared with deep-learning projections for the next quarter.</p>
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Income</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Expense</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border-2 border-dashed border-primary" /> Forecast</div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C5BB0" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6C5BB0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5', fontWeight: 600 }} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#6C5BB0', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: "#150F1D", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "4px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="income" stroke="#6C5BB0" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="predicted" stroke="#6C5BB0" strokeWidth={1} fill="transparent" strokeDasharray="10 10" opacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown & AI Insights */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 flex flex-col shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">Category Allocation</h3>
            <div className="flex-1 w-full min-h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#150F1D", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
              {expensesByCategory.slice(0, 3).map(ex => (
                <div key={ex.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ex.color }} />
                    <span className="text-muted-foreground">{ex.name}</span>
                  </div>
                  <span>${ex.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-sm p-8 flex-1 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 rotate-12 transition-transform group-hover:scale-110">
              <Brain className="h-24 w-24 text-primary" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-sm">
                  <Percent className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Strategic Advantage</h3>
              </div>
              <p className="text-sm font-bold leading-relaxed text-foreground/90 italic">
                "Your project-specific ROI is 18% higher when tasks are completed in the morning focus block. Strategic reinvestment of $5k suggested for Q4."
              </p>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 group/btn border-b border-primary/20 pb-1 self-start hover:border-primary transition-all">
              OPTIMIZE SPENDING <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-[#0A0710] border border-white/5 rounded-sm overflow-hidden flex flex-col h-[450px] shadow-2xl">
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-[#0F0B15]/40 backdrop-blur-sm">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Strategic Ledger</h3>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">Showing last 24 transactions across 5 projects</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#150F1D] border border-white/5 rounded-sm px-3 py-1.5 flex items-center gap-2">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground">FILTER</span>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-2 rounded-sm hover:bg-primary/20 transition-all">Full Report</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto tiny-scrollbar">
          <div className="divide-y divide-white/5">
            {transactions.map(t => (
              <div key={t.id} onClick={() => setSelectedTransaction(t)} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.02] transition-all group cursor-pointer border-l-2 border-transparent hover:border-primary">
                <div className="col-span-1 flex justify-center">
                  <div className={`p-3 rounded-sm ${t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]'}`}>
                    {t.type === 'Income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                </div>
                <div className="col-span-5">
                  <div className="text-sm font-black group-hover:text-primary transition-colors">{t.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{t.category}</span>
                    <span className="text-[10px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-sm">{t.project}</span>
                  </div>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground font-black uppercase tracking-tighter">{t.date}</div>
                <div className="col-span-2">
                  <span className={`text-sm font-black tracking-tighter ${t.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.amount}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Editor Modal */}
      <AnimatePresence>
        {showInvoiceModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInvoiceModal(false)} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100]" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="fixed inset-0 m-auto w-full max-w-3xl h-fit max-h-[90vh] bg-[#0A0710] border border-white/10 z-[101] shadow-2xl flex flex-col rounded-sm overflow-hidden">
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-primary/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_-20%,rgba(108,91,176,0.15),transparent)] pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-primary rounded-sm shadow-xl shadow-primary/20"><Receipt className="h-6 w-6 text-primary-foreground" /></div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Strategic Invoice</h2>
                    <p className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">AI-Optimized Billing Engine</p>
                  </div>
                </div>
                <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors relative z-10"><X className="h-7 w-7" /></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto tiny-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Select Client</label>
                    <div className="relative">
                      <input type="text" placeholder="Start typing client name..." className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-5 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all" />
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Project Association</label>
                    <select className="w-full bg-[#150F1D] border border-white/10 rounded-sm px-5 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all appearance-none">
                      <option className="bg-[#0A0710]">Marketing Site Redesign</option>
                      <option className="bg-[#0A0710]">Infrastructure Scale</option>
                      <option className="bg-[#0A0710]">Cognis Mobile Dev</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Billable Items</h3>
                    <button className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <Plus className="h-3 w-3" /> ADD CUSTOM LINE
                    </button>
                  </div>
                  <div className="space-y-3">
                    <InvoiceLineItem title="Phase 1: Design Strategy" rate="$120/hr" hours="24h" total="$2,880" />
                    <InvoiceLineItem title="Phase 2: Core Development" rate="$150/hr" hours="12h" total="$1,800" />
                    <div className="p-4 rounded-sm border border-dashed border-white/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:bg-white/5 transition-all cursor-pointer">
                      AI SUGGESTION: ADD "QA & TESTING" (8H)
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col items-end gap-3">
                  <div className="flex gap-16 text-sm">
                    <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-1">Subtotal</span>
                    <span className="font-black text-lg">$4,680.00</span>
                  </div>
                  <div className="flex gap-16 text-sm">
                    <span className="text-muted-foreground font-black uppercase tracking-widest text-[10px] mt-1">Tax (18%)</span>
                    <span className="font-black text-lg">$842.40</span>
                  </div>
                  <div className="flex gap-16 text-2xl font-black mt-4 pt-4 border-t border-primary/20 w-full justify-end">
                    <span className="text-primary uppercase tracking-[0.4em] text-[10px] mt-3">Grand Total</span>
                    <span className="text-primary text-4xl tracking-tighter">$5,522.40</span>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-white/5 flex gap-6 bg-[#0F0B15]/60">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-sm text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  <Download className="h-5 w-5" /> GENERATE & SEND
                </button>
                <button className="px-10 border border-white/10 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/5 transition-all">
                  SAVE AS DRAFT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transaction Detail Sheet */}
      <AnimatePresence>
        {selectedTransaction && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTransaction(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0A0710] border-l border-white/5 z-[101] shadow-2xl flex flex-col p-10 space-y-12">
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-sm ${selectedTransaction.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {selectedTransaction.type === 'Income' ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownRight className="h-8 w-8" />}
                </div>
                <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-white/10 rounded-sm text-muted-foreground transition-colors"><X className="h-7 w-7" /></button>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter">{selectedTransaction.name}</h2>
                <div className="flex items-center gap-4">
                  <span className={`text-xl font-black ${selectedTransaction.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedTransaction.amount}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-sm text-muted-foreground border border-white/5">{selectedTransaction.status}</span>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                <DetailMeta label="TRANSACTION DATE" value={selectedTransaction.date} />
                <DetailMeta label="STRATEGIC CATEGORY" value={selectedTransaction.category} />
                <DetailMeta label="PROJECT LINK" value={selectedTransaction.project} isPrimary />
              </div>

              <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5" /> Financial Insight
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  This {selectedTransaction.type.toLowerCase()} was processed via Stripe and linked to your **{selectedTransaction.project}** deliverables. Tax obligations have been pre-calculated.
                </p>
              </div>

              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 mt-auto">
                <Download className="h-4 w-4" /> DOWNLOAD RECEIPT
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

function InvoiceLineItem({ title, rate, hours, total }: any) {
  return (
    <div className="grid grid-cols-12 gap-4 p-5 rounded-sm bg-[#150F1D] border border-white/5 items-center group hover:border-primary/30 transition-all">
      <div className="col-span-7 flex flex-col">
        <span className="text-xs font-black group-hover:text-primary transition-colors uppercase tracking-widest">{title}</span>
        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Strategic Development Block</span>
      </div>
      <div className="col-span-2 text-center text-xs font-black text-muted-foreground">{rate}</div>
      <div className="col-span-1 text-center text-xs font-black text-muted-foreground">{hours}</div>
      <div className="col-span-2 text-right text-sm font-black text-primary">{total}</div>
    </div>
  );
}

function DetailMeta({ label, value, isPrimary = false }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
      <span className={`text-sm font-black ${isPrimary ? 'text-primary' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function FinanceKpiCard({ label, value, change, trend, icon: Icon, color = "default" }: any) {
  const isUp = trend === "up";
  const trendColor = isUp ? "text-emerald-500" : "text-rose-500";
  
  return (
    <div className="bg-[#0A0710] border border-white/5 rounded-sm p-8 group relative overflow-hidden shadow-2xl transition-all hover:border-white/10">
      <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color === 'primary' ? 'text-primary' : 'text-foreground'}`}>
        <Icon className="h-20 w-20" />
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">{label}</div>
      <div className="flex items-baseline gap-3 relative z-10">
        <span className="text-3xl font-black text-foreground tracking-tighter leading-none">{value}</span>
        <div className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-sm bg-white/5 ${trendColor}`}>
          {isUp ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />} {change}
        </div>
      </div>
    </div>
  );
}
