'use client';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, Receipt, TrendingUp, AlertTriangle, CheckSquare, RefreshCw, Plus } from 'lucide-react';
import Link from 'next/link';
import { analyticsApi, tasksApi } from '@/lib/api';
import { KpiCard } from '@/components/shared/KpiCard';
import { formatCurrency, formatDate, formatRelative, daysOverdue, getRiskBadgeClasses } from '@/lib/utils';
import { cn } from '@/lib/utils';

const AGING_COLORS = ['#007fb1', '#2eab6f', '#f0a500', '#d96000', '#d94040'];
const RISK_COLORS = ['#2eab6f', '#60b347', '#f0a500', '#d96000', '#d94040'];

// Mock data for charts (replace with API calls in production)
const dsoTrendData = [
  { month: 'Jun', dso: 52, target: 45 }, { month: 'Jul', dso: 50, target: 45 },
  { month: 'Aug', dso: 51, target: 45 }, { month: 'Sep', dso: 49, target: 45 },
  { month: 'Oct', dso: 53, target: 45 }, { month: 'Nov', dso: 51, target: 45 },
  { month: 'Dec', dso: 49, target: 45 }, { month: 'Jan', dso: 48, target: 45 },
  { month: 'Feb', dso: 50, target: 45 }, { month: 'Mar', dso: 48, target: 45 },
  { month: 'Apr', dso: 47, target: 45 }, { month: 'May', dso: 47, target: 45 },
];

const agingData = [
  { bucket: 'Not due', amount: 6472 },
  { bucket: '1-30d', amount: 2000 },
  { bucket: '31-60d', amount: 900 },
  { bucket: '61-90d', amount: 600 },
  { bucket: '>90d', amount: 400 },
];

const cashData = [
  { month: 'Jan', collected: 7200, target: 9000 },
  { month: 'Feb', collected: 8100, target: 9000 },
  { month: 'Mar', collected: 8400, target: 9000 },
  { month: 'Apr', collected: 8700, target: 9000 },
  { month: 'May', collected: 8912, target: 9000 },
];

const riskData = [
  { name: 'Low', value: 52 }, { name: 'Medium', value: 30 },
  { name: 'High', value: 13 }, { name: 'Critical', value: 5 },
];

const topRiskyCustomers = [
  { name: 'Omega Group', overdue: 84200, risk: 'CRITICAL', dso: 78, id: '1' },
  { name: 'Vertex Inc', overdue: 62100, risk: 'HIGH', dso: 65, id: '2' },
  { name: 'BlueStar Ltd', overdue: 38000, risk: 'HIGH', dso: 58, id: '3' },
  { name: 'Nexus Corp', overdue: 22000, risk: 'MEDIUM', dso: 44, id: '4' },
  { name: 'Apex Trading', overdue: 7850, risk: 'MEDIUM', dso: 38, id: '5' },
];

const todayAgenda = [
  { id: '1', title: 'Call — Omega Group: overdue follow-up', customer: 'Omega Group', amount: 84200, priority: 'CRITICAL', type: 'CALL', done: false },
  { id: '2', title: 'Email — Vertex Inc: 2nd reminder', customer: 'Vertex Inc', amount: 42100, priority: 'HIGH', type: 'EMAIL', done: false },
  { id: '3', title: 'Legal — Omega Group INV-1942', customer: 'Omega Group', amount: 40000, priority: 'CRITICAL', type: 'LEGAL', done: false },
  { id: '4', title: 'Dispute review — Apex Trading', customer: 'Apex Trading', amount: 7850, priority: 'MEDIUM', type: 'DISPUTE', done: false },
  { id: '5', title: 'Payment confirmed — Kestrel Ltd', customer: 'Kestrel Ltd', amount: 12400, priority: 'LOW', type: 'EMAIL', done: true },
];

const activityFeed = [
  { icon: '✅', text: 'Payment received', sub: 'Kestrel Ltd — €12,400 · INV-2033', time: '18m ago', color: 'text-success' },
  { icon: '⚠', text: 'Invoice overdue', sub: 'Omega Group — €84,200 · INV-2041', time: '2h ago', color: 'text-danger' },
  { icon: '🔄', text: 'SAP sync completed', sub: '248 invoices · 14 new customers', time: '1h ago', color: 'text-brand-500' },
  { icon: '⚡', text: 'Dispute opened', sub: 'Apex Trading — €7,850 · INV-2018', time: '3h ago', color: 'text-warning' },
  { icon: '🤖', text: 'AI risk alert', sub: 'Vertex Inc flagged — score 72/100', time: '5h ago', color: 'text-purple-600' },
];

const priorityColor: Record<string, string> = {
  CRITICAL: 'text-danger', HIGH: 'text-orange-500', MEDIUM: 'text-warning', LOW: 'text-success',
};
const priorityDot: Record<string, string> = {
  CRITICAL: 'bg-danger', HIGH: 'bg-orange-500', MEDIUM: 'bg-warning', LOW: 'bg-success',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded shadow-dropdown p-2.5 text-xs">
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{typeof p.value === 'number' && p.value > 100 ? formatCurrency(p.value * 1000) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: analyticsApi.dashboard,
    staleTime: 30000,
  });

  const kpiData = (kpis as any)?.data || {};

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Dashboard — Global Indicators
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">May 2026 · All entities · EUR · Real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="form-select text-xs">
            <option>All entities</option>
            <option>Acme France</option>
            <option>Acme Germany</option>
          </select>
          <select className="form-select text-xs">
            <option>May 2026</option>
            <option>Q1 2026</option>
            <option>YTD 2026</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link href="/dashboard/invoices/new">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Invoice
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="DSO" value={`${kpiData.dso ?? 47.3}d`} sub="vs last month" trend={2.1} color="blue" loading={kpisLoading} />
        <KpiCard label="Total Overdue" value={formatCurrency(kpiData.totalOverdue ?? 2471840, 'EUR', true)} sub="vs last month" trend={8.3} color="red" loading={kpisLoading} />
        <KpiCard label="Cash Collected (MTD)" value={formatCurrency(kpiData.cashCollected ?? 8912300, 'EUR', true)} trendLabel="vs last month" trend={-12.4} color="green" loading={kpisLoading} />
        <KpiCard label="Collection Rate" value={`${kpiData.collectionRate ?? 84.2}%`} trendLabel="improving" trend={-3.1} color="amber" loading={kpisLoading} />
        <KpiCard label="Outstanding Balance" value={formatCurrency(kpiData.totalOutstanding ?? 8944100, 'EUR', true)} sub="1,284 open invoices" color="purple" loading={kpisLoading} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Aging Balance */}
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5 text-brand-500" />Aging Balance — Outstanding</span>
            <span className="text-2xs text-muted-foreground font-normal">€ thousands</span>
          </div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={agingData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `€${v}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
                  {agingData.map((_, i) => <Cell key={i} fill={AGING_COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DSO Trend */}
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-brand-500" />DSO Evolution — 12 months</span>
            <span className="text-2xs text-muted-foreground font-normal">days · Target: 45d</span>
          </div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dsoTrendData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `${v}d`} domain={[38, 58]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="dso" stroke="#007fb1" strokeWidth={2} dot={{ r: 3, fill: '#007fb1' }} name="DSO" />
                <Line type="monotone" dataKey="target" stroke="#2eab6f" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 + Widgets */}
      <div className="grid grid-cols-3 gap-3">
        {/* Cash Collection */}
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-brand-500" />Cash Collection vs Target</span>
          </div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={cashData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(v) => `€${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="collected" fill="#2eab6f" radius={[2, 2, 0, 0]} name="Collected" />
                <Bar dataKey="target" fill="#007fb120" radius={[2, 2, 0, 0]} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-brand-500" />Risk Distribution</span>
          </div>
          <div className="panel-body">
            <div className="flex gap-4 items-center">
              <ResponsiveContainer width={120} height={140}>
                <PieChart>
                  <Pie data={riskData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
                    {riskData.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 text-xs">
                {riskData.map((r, i) => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm" style={{ background: RISK_COLORS[i] }} />
                    <span className="text-muted-foreground">{r.name}</span>
                    <span className="font-bold ml-auto">{r.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Risky */}
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-brand-500" />Top Risky Customers</span>
            <Link href="/dashboard/risk" className="text-2xs text-brand-500 hover:underline">View all</Link>
          </div>
          <div className="panel-body space-y-2">
            {topRiskyCustomers.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1 border-b border-border/60 last:border-0">
                <Link href={`/dashboard/customers/${c.id}`} className="text-xs font-medium text-brand-500 hover:underline truncate max-w-[120px]">
                  {c.name}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{c.dso}d DSO</span>
                  <span className={cn('pill text-2xs', getRiskBadgeClasses(c.risk))}>{c.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Agenda */}
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-brand-500" />Today's Agenda
              <span className="bg-danger text-white text-2xs font-bold px-1.5 py-0.5 rounded-full">12</span>
            </span>
            <Link href="/dashboard/agenda" className="text-2xs text-brand-500 hover:underline">Full agenda</Link>
          </div>
          <div className="panel-body divide-y divide-border/60">
            {todayAgenda.map((task) => (
              <div key={task.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0', task.done ? 'bg-success' : priorityDot[task.priority])} />
                <div className="flex-1 min-w-0">
                  <div className={cn('text-xs font-medium truncate', task.done && 'line-through text-muted-foreground')}>
                    {task.title}
                  </div>
                  <div className="text-2xs text-muted-foreground">{formatCurrency(task.amount, 'EUR', true)}</div>
                </div>
                <span className={cn('text-2xs font-bold', task.done ? 'text-success' : priorityColor[task.priority])}>
                  {task.done ? 'DONE' : task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-brand-500" />Recent Activity</span>
          </div>
          <div className="panel-body divide-y divide-border/60">
            {activityFeed.map((a, i) => (
              <div key={i} className="flex gap-2.5 py-2 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className={cn('text-xs font-medium', a.color)}>{a.icon} {a.text}</div>
                  <div className="text-2xs text-muted-foreground mt-0.5">{a.sub}</div>
                </div>
                <span className="text-2xs text-muted-foreground flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
