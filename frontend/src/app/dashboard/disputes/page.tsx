'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const DISPUTES = [
  {id:'1',reference:'DIS-042',customer:'Apex Trading',invoice:'INV-2018',type:'AMOUNT',amount:7850,reason:'Pricing discrepancy vs contract',openedAt:'2026-04-20',status:'OPEN',assignee:'A. Noel'},
  {id:'2',reference:'DIS-041',customer:'BlueStar Ltd',invoice:'INV-2024',type:'QUALITY',amount:38000,reason:'Goods do not meet specification',openedAt:'2026-03-28',status:'IN_REVIEW',assignee:'S. Martin'},
  {id:'3',reference:'DIS-039',customer:'Nexus Corp',invoice:'INV-2011',type:'DELIVERY',amount:12400,reason:'Late delivery — penalty clause',openedAt:'2026-03-15',status:'IN_REVIEW',assignee:'M. Dupont'},
  {id:'4',reference:'DIS-038',customer:'Vertex Inc',invoice:'INV-1990',type:'AMOUNT',amount:8200,reason:'Duplicate invoice issued',openedAt:'2026-03-01',status:'RESOLVED',assignee:'S. Martin'},
  {id:'5',reference:'DIS-035',customer:'Omega Group',invoice:'INV-1950',type:'QUALITY',amount:15000,reason:'Product defect batch 22-A',openedAt:'2026-02-14',status:'RESOLVED',assignee:'A. Noel'},
];

const typeColors:Record<string,string> = {AMOUNT:'pill-info',QUALITY:'pill-partial',DELIVERY:'pill-disputed'};
const statusColors:Record<string,string> = {OPEN:'pill-overdue',IN_REVIEW:'pill-partial',RESOLVED:'pill-paid',REJECTED:'pill-pending',ESCALATED:'pill-legal'};

const cols: Column[] = [
  {key:'reference',label:'Ref',render:v=><span className="font-semibold text-brand-500">{v}</span>},
  {key:'customer',label:'Customer',render:v=><span className="font-medium">{v}</span>},
  {key:'invoice',label:'Invoice',render:v=><span className="text-brand-500">{v}</span>},
  {key:'type',label:'Type',render:v=><span className={`pill ${typeColors[v]||'pill-pending'}`}>{v}</span>},
  {key:'amount',label:'Amount',render:v=><span className="font-bold">{formatCurrency(v)}</span>},
  {key:'reason',label:'Reason',className:'max-w-xs',render:v=><span className="text-muted-foreground truncate block max-w-[200px]">{v}</span>},
  {key:'openedAt',label:'Opened',render:v=><span className="text-muted-foreground">{formatDate(v)}</span>},
  {key:'status',label:'Status',render:v=><span className={`pill ${statusColors[v]||'pill-pending'}`}>{v.replace('_',' ')}</span>},
  {key:'assignee',label:'Assigned',render:v=><span className="text-muted-foreground">{v}</span>},
  {key:'actions',label:'',render:()=><button className="px-2 py-1 text-2xs border border-border rounded hover:border-brand-500 hover:text-brand-500">View</button>},
];

export default function DisputesPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Disputes</h1><p className="text-xs text-muted-foreground mt-0.5">7 open disputes · €340k total</p></div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>New Dispute</button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Open" value="7" sub="€340k total" color="red"/>
        <KpiCard label="In Review" value="3" sub="€208k" color="amber"/>
        <KpiCard label="Resolved MTD" value="12" sub="€124k recovered" color="green"/>
        <KpiCard label="Avg Resolution" value="18d" sub="-3d vs last month" color="blue"/>
      </div>
      <div className="panel">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary/30">
          <select className="form-select text-xs"><option value="">All types</option><option>AMOUNT</option><option>QUALITY</option><option>DELIVERY</option></select>
          <select className="form-select text-xs"><option value="">All statuses</option><option>OPEN</option><option>IN_REVIEW</option><option>RESOLVED</option></select>
          <span className="ml-auto text-xs text-muted-foreground">{DISPUTES.length} disputes</span>
        </div>
        <DataTable columns={cols} data={DISPUTES} total={DISPUTES.length} selectable />
      </div>
    </div>
  );
}
