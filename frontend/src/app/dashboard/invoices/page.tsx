'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Download, Mail, Search } from 'lucide-react';
import { invoicesApi } from '@/lib/api';
import { DataTable, Column } from '@/components/shared/DataTable';
import { KpiCard } from '@/components/shared/KpiCard';
import { formatCurrency, formatDate, daysOverdue, getStatusBadgeClasses, getStatusLabel, cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

const columns: Column[] = [
  { key: 'number', label: 'Invoice', sortable: true, render: (v) => <span className="font-semibold text-brand-500">{v}</span> },
  { key: 'customer', label: 'Customer', render: (_, row) => <span className="font-medium">{row.customer?.name}</span> },
  { key: 'erpReference', label: 'ERP Ref', render: (v) => <span className="text-muted-foreground">{v || '—'}</span> },
  { key: 'issueDate', label: 'Issue date', render: (v) => <span className="text-muted-foreground">{formatDate(v)}</span> },
  { key: 'dueDate', label: 'Due date', sortable: true, render: (v, row) => {
    const d = daysOverdue(v);
    return <span className={cn(d > 0 ? 'text-danger font-bold' : 'text-muted-foreground')}>{formatDate(v)}{d > 0 ? ` (+${d}d)` : ''}</span>;
  }},
  { key: 'amount', label: 'Amount', sortable: true, render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
  { key: 'amountPaid', label: 'Paid', render: (v) => <span className={v > 0 ? 'text-success' : 'text-muted-foreground'}>{formatCurrency(v)}</span> },
  { key: 'amountDue', label: 'Balance', sortable: true, render: (v) => <span className={cn('font-bold', v > 0 ? 'text-danger' : 'text-success')}>{formatCurrency(v)}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={getStatusBadgeClasses(v)}>{getStatusLabel(v)}</span> },
  { key: 'reminderCount', label: 'Reminders', render: (v) => v > 0 ? <span className="pill pill-partial">{v} sent</span> : <span className="text-muted-foreground">—</span> },
  { key: 'actions', label: '', render: (_, row) => (
    <div className="flex gap-1">
      {['OVERDUE','PARTIALLY_PAID'].includes(row.status) && (
        <button className="px-2 py-1 text-2xs bg-brand-500 text-white rounded hover:bg-brand-600">Remind</button>
      )}
      <button className="px-2 py-1 text-2xs border border-border rounded hover:border-brand-500 hover:text-brand-500">View</button>
    </div>
  )},
];

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, search, status, sortBy, sortOrder],
    queryFn: () => invoicesApi.list({ page, limit: 20, search, status, sortBy, sortOrder }),
    staleTime: 30000,
  });

  const invoices = (data as any)?.data || [];
  const meta = (data as any)?.meta || { total: 0 };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Invoice Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{meta.total} invoices · Real-time</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Mail className="w-3.5 h-3.5" />Bulk Reminder</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Download className="w-3.5 h-3.5" />Export</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5" />New Invoice</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Total Outstanding" value="€8.94M" sub="1,284 invoices" color="blue" />
        <KpiCard label="Overdue" value="€2.47M" sub="287 invoices" color="red" trend={8.3} />
        <KpiCard label="Disputed" value="€340k" sub="7 disputes" color="amber" />
        <KpiCard label="Paid This Month" value="€3.12M" sub="421 invoices" color="green" />
        <KpiCard label="Promise to Pay" value="€680k" sub="34 invoices" color="purple" />
      </div>

      <div className="panel">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
          <div className="flex items-center bg-white border border-border rounded px-2 gap-1.5">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Invoice number, customer..." onChange={e => debounce((v: string) => { setSearch(v); setPage(1); })(e.target.value)} className="text-xs py-1.5 outline-none bg-transparent w-48" />
          </div>
          <select className="form-select text-xs" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_PAID">Partial</option>
            <option value="DISPUTED">Disputed</option>
            <option value="PAID">Paid</option>
            <option value="LEGAL">Legal</option>
          </select>
          <span className="ml-auto text-xs text-muted-foreground">{meta.total} results</span>
        </div>
        <DataTable columns={columns} data={invoices} total={meta.total} page={page} pageSize={20}
          onPageChange={setPage} onSort={(k,d) => { setSortBy(k); setSortOrder(d); }}
          sortKey={sortBy} sortDir={sortOrder} selectable loading={isLoading}
          rowClassName={row => ['OVERDUE','LEGAL'].includes(row.status) ? 'overdue-row' : ''} />
      </div>
    </div>
  );
}
