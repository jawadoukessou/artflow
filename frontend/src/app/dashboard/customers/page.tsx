'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Download, Upload, Search } from 'lucide-react';
import Link from 'next/link';
import { customersApi } from '@/lib/api';
import { DataTable, Column } from '@/components/shared/DataTable';
import { formatCurrency, formatDate, formatDays, getRiskBadgeClasses, getRiskLabel, getStatusBadgeClasses, getStatusLabel, cn } from '@/lib/utils';

// Fallback mock data when backend not available
const MOCK_CUSTOMERS = [
  {id:'1',name:'Omega Group',code:'OMG-001',country:'FR',creditLimit:500000,outstandingBalance:284200,overdueBalance:84200,latestRisk:{level:'CRITICAL',score:87,dso:78,avgPaymentDelay:45},collector:{firstName:'Sarah',lastName:'Martin'},status:'ACTIVE'},
  {id:'2',name:'Vertex Inc',code:'VTX-044',country:'DE',creditLimit:300000,outstandingBalance:198500,overdueBalance:62100,latestRisk:{level:'HIGH',score:72,dso:65,avgPaymentDelay:32},collector:{firstName:'Marc',lastName:'Dupont'},status:'ACTIVE'},
  {id:'3',name:'Kestrel Ltd',code:'KST-012',country:'GB',creditLimit:750000,outstandingBalance:412000,overdueBalance:0,latestRisk:{level:'LOW',score:18,dso:31,avgPaymentDelay:2},collector:{firstName:'Anne',lastName:'Noel'},status:'ACTIVE'},
  {id:'4',name:'BlueStar Ltd',code:'BLS-088',country:'ES',creditLimit:200000,outstandingBalance:145000,overdueBalance:38000,latestRisk:{level:'HIGH',score:68,dso:58,avgPaymentDelay:28},collector:{firstName:'Sarah',lastName:'Martin'},status:'ACTIVE'},
  {id:'5',name:'Nexus Corp',code:'NXS-061',country:'IT',creditLimit:400000,outstandingBalance:223000,overdueBalance:22000,latestRisk:{level:'MEDIUM',score:44,dso:44,avgPaymentDelay:14},collector:{firstName:'Marc',lastName:'Dupont'},status:'ACTIVE'},
  {id:'6',name:'Apex Trading',code:'APX-033',country:'FR',creditLimit:150000,outstandingBalance:78400,overdueBalance:7850,latestRisk:{level:'MEDIUM',score:41,dso:38,avgPaymentDelay:8},collector:{firstName:'Anne',lastName:'Noel'},status:'ACTIVE'},
  {id:'7',name:'Solaris SA',code:'SLR-099',country:'DE',creditLimit:600000,outstandingBalance:512000,overdueBalance:0,latestRisk:{level:'LOW',score:12,dso:28,avgPaymentDelay:-3},collector:{firstName:'Sarah',lastName:'Martin'},status:'ACTIVE'},
  {id:'8',name:'Titan Pharma',code:'TTN-007',country:'GB',creditLimit:1000000,outstandingBalance:720000,overdueBalance:0,latestRisk:{level:'LOW',score:8,dso:22,avgPaymentDelay:-8},collector:{firstName:'Marc',lastName:'Dupont'},status:'ACTIVE'},
];

const columns: Column[] = [
  { key:'name', label:'Customer', sortable:true, render:(v,row) => <Link href={`/dashboard/customers/${row.id}`} className="font-semibold text-brand-500 hover:underline">{v}</Link> },
  { key:'code', label:'Code', render:v => <span className="text-muted-foreground">{v}</span> },
  { key:'country', label:'Country' },
  { key:'creditLimit', label:'Credit Limit', sortable:true, render:v => formatCurrency(v,'EUR',true) },
  { key:'outstandingBalance', label:'Outstanding', sortable:true, render:v => <span className="font-semibold">{formatCurrency(v,'EUR',true)}</span> },
  { key:'overdueBalance', label:'Overdue', sortable:true, render:v => <span className={cn('font-bold', v>0?'text-danger':'text-success')}>{formatCurrency(v,'EUR',true)}</span> },
  { key:'latestRisk', label:'Risk', render:v => v ? <span className={cn('pill', getRiskBadgeClasses(v.level))}>{getRiskLabel(v.level)}</span> : '—' },
  { key:'latestRisk', label:'DSO', render:v => v ? <span className={cn(v.dso>45?'text-danger':'text-success','font-medium')}>{v.dso}d</span> : '—' },
  { key:'latestRisk', label:'Avg Delay', render:v => v ? <span className={cn(v.avgPaymentDelay>0?'text-warning':'text-success','font-medium')}>{formatDays(v.avgPaymentDelay)}</span> : '—' },
  { key:'collector', label:'Collector', render:v => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key:'status', label:'Status', render:v => <span className={cn('pill', v==='ACTIVE'?'pill-paid':'pill-overdue')}>{v}</span> },
  { key:'id', label:'', render:(_,row) => <div className="flex gap-1"><Link href={`/dashboard/customers/${row.id}`}><button className="px-2 py-1 text-2xs border border-border rounded hover:border-brand-500 hover:text-brand-500">View</button></Link></div> },
];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search, riskLevel],
    queryFn: () => customersApi.list({ page, limit: 20, search, riskLevel }),
    staleTime: 30000,
    retry: false,
  });

  const customers = (data as any)?.data || MOCK_CUSTOMERS;
  const total = (data as any)?.meta?.total || MOCK_CUSTOMERS.length;

  const filtered = search
    ? customers.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : customers;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Customers</h1><p className="text-xs text-muted-foreground mt-0.5">{total} customers · 38 at risk</p></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Upload className="w-3.5 h-3.5"/>Import</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Download className="w-3.5 h-3.5"/>Export</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>New Customer</button>
        </div>
      </div>
      <div className="panel">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
          <div className="flex items-center bg-white border border-border rounded px-2 gap-1.5">
            <Search className="w-3.5 h-3.5 text-muted-foreground"/>
            <input type="text" placeholder="Search name, code..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="text-xs py-1.5 outline-none bg-transparent w-48"/>
          </div>
          <select className="form-select text-xs" value={riskLevel} onChange={e=>{setRiskLevel(e.target.value);setPage(1);}}>
            <option value="">All risk levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} results</span>
        </div>
        <DataTable columns={columns} data={filtered} total={filtered.length} page={page} pageSize={20}
          onPageChange={setPage} selectable loading={isLoading}
          rowClassName={row => row.overdueBalance > 0 ? 'overdue-row' : ''} />
      </div>
    </div>
  );
}
