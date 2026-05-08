"use client";

import { Search, Filter, Brain, ArrowUpRight, ArrowDownRight, DollarSign, Activity, PieChart, Download, Wallet, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell
} from "recharts";

// Mock Data
const cashFlowData = [
  { month: "Jan", in: 45000, out: 28000 },
  { month: "Feb", in: 52000, out: 31000 },
  { month: "Mar", in: 48000, out: 29000 },
  { month: "Apr", in: 61000, out: 34000 },
  { month: "May", in: 59000, out: 42000 },
  { month: "Jun", in: 75000, out: 38000 },
];

const expensesData = [
  { name: "Payroll", value: 45000, color: "#6C5BB0" },
  { name: "Software/SaaS", value: 12000, color: "#54468B" },
  { name: "Marketing", value: 18000, color: "#3B3161" },
  { name: "Office/Rent", value: 8000, color: "#221C38" },
];

const recentTransactions = [
  { id: 1, desc: "Stripe Payout", category: "Revenue", amount: "+$12,450.00", date: "Today", status: "Completed" },
  { id: 2, desc: "Amazon Web Services", category: "Software", amount: "-$3,240.50", date: "Yesterday", status: "Completed" },
  { id: 3, desc: "Google Ads", category: "Marketing", amount: "-$4,500.00", date: "May 15", status: "Pending" },
  { id: 4, desc: "WeWork Remote", category: "Office", amount: "-$1,200.00", date: "May 12", status: "Completed" },
];

export default function FinancePage() {
  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col text-foreground font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mt-4">
        <h1 className="text-lg font-medium text-muted-foreground">
          <span className="text-foreground">Management</span> / Finance
        </h1>
        <div className="flex items-center gap-3">
          <button className="bg-white/5 hover:bg-white/10 text-foreground border border-white/10 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Download className="h-4 w-4" />
            STATEMENT
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/20 px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-2 transition-colors">
            <Plus className="h-4 w-4" />
            NEW INVOICE
          </button>
        </div>
      </div>

      {/* AI Financial Analyst */}
      <div className="rounded-sm border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm shrink-0">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
              AI Financial Analyst
            </h3>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
              I detected an anomaly: <strong>Software/SaaS expenses</strong> increased by 22% compared to last month. Specifically, AWS costs spiked. AI recommends auditing idle EC2 instances to save approximately $850/mo.
            </p>
          </div>
        </div>
        <button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 px-4 py-2 rounded-sm text-xs font-semibold transition-colors shrink-0">
          Run Cloud Audit
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" /> Total Revenue (MTD)
          </h3>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-3xl font-bold text-foreground">$124,500</span>
            <span className="text-xs text-emerald-500 flex items-center font-medium mb-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 8.4%
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" /> Monthly Burn Rate
          </h3>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-3xl font-bold text-foreground">$42,300</span>
            <span className="text-xs text-red-500 flex items-center font-medium mb-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 2.1%
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Wallet className="h-3.5 w-3.5" /> Cash Runway
          </h3>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-3xl font-bold text-foreground">14.2</span>
            <span className="text-xs text-muted-foreground flex items-center font-medium mb-1">
              Months
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-primary" /> AI Profitability Score
          </h3>
          <div className="flex items-end gap-3 mb-1">
            <span className="text-3xl font-bold text-primary">94/100</span>
            <span className="text-xs text-emerald-500 flex items-center font-medium mb-1">
              Optimal
            </span>
          </div>
        </div>

      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Cash Flow Chart */}
        <div className="xl:col-span-2 rounded-sm border border-white/5 bg-[#0A0710] p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-semibold mb-1">Cash Flow Overview</h3>
              <p className="text-xs text-muted-foreground">Revenue vs Expenses over the last 6 months.</p>
            </div>
            <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-emerald-500"></div> Inflow</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-sm bg-red-500"></div> Outflow</div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8F89A5' }} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px", color: "#FBF9FE", borderRadius: "4px" }} 
                  itemStyle={{ color: "#FBF9FE" }}
                />
                <Bar dataKey="in" fill="#10b981" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="out" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Pie & Recent Transactions */}
        <div className="flex flex-col gap-6">
          
          <div className="rounded-sm border border-white/5 bg-[#0A0710] p-6 flex-1 flex flex-col">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Expenses Breakdown</h3>
            <div className="flex-1 w-full flex items-center justify-center relative min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {expensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1F172B", border: "none", fontSize: "12px" }} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total</span>
                <span className="text-sm font-bold">$83k</span>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {expensesData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">${(item.value / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* AI Categorized Transactions */}
      <div className="bg-[#0A0710] rounded-sm border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-semibold">Recent Transactions</h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1"><Brain className="h-3 w-3" /> Auto-Categorized by AI</span>
        </div>
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-[#0F0B15]/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1 text-right">Status</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.02] transition-colors">
              <div className="col-span-5 text-sm font-medium">{tx.desc}</div>
              <div className="col-span-2 text-xs text-muted-foreground">{tx.category}</div>
              <div className="col-span-2 text-xs text-muted-foreground">{tx.date}</div>
              <div className={`col-span-2 text-sm font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-foreground'}`}>
                {tx.amount}
              </div>
              <div className="col-span-1 text-right">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm border inline-block ${
                    tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
