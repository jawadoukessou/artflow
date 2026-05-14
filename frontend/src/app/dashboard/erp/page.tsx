'use client';
import { useState } from 'react';
import { RefreshCw, Plus, Upload } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { formatDate, cn } from '@/lib/utils';

const CONNECTORS = [
  {id:'1',name:'SAP S/4HANA',type:'SAP',status:'CONNECTED',lastSync:'2026-05-08 14:32',records:248,errors:0,schedule:'Every 4h'},
  {id:'2',name:'Oracle ERP Cloud',type:'ORACLE',status:'ERROR',lastSync:'2026-05-08 09:15',records:3,errors:3,schedule:'Daily 09:00'},
  {id:'3',name:'Microsoft Dynamics 365',type:'DYNAMICS',status:'CONNECTED',lastSync:'2026-05-07 23:00',records:182,errors:0,schedule:'Daily 23:00'},
  {id:'4',name:'Sage Intacct',type:'SAGE',status:'PENDING',lastSync:null,records:0,errors:0,schedule:'Not configured'},
  {id:'5',name:'Odoo ERP',type:'ODOO',status:'PENDING',lastSync:null,records:0,errors:0,schedule:'Not configured'},
  {id:'6',name:'CSV / Excel Import',type:'CSV',status:'CONNECTED',lastSync:'2026-05-08 10:00',records:50,errors:0,schedule:'Manual'},
];

const LOGS = [
  {id:'1',timestamp:'2026-05-08 14:32:01',type:'INVOICES',records:248,status:'SUCCESS',duration:'4.2s',message:'Full sync completed'},
  {id:'2',timestamp:'2026-05-08 08:00:00',type:'PAYMENTS',records:32,status:'SUCCESS',duration:'1.8s',message:'Scheduled sync'},
  {id:'3',timestamp:'2026-05-07 23:00:00',type:'CUSTOMERS',records:14,status:'SUCCESS',duration:'0.9s',message:'New customers added'},
  {id:'4',timestamp:'2026-05-07 14:15:22',type:'INVOICES',records:3,status:'FAILED',duration:'—',message:"Mapping error: field 'currency_code' missing"},
];

const statusDot:Record<string,string>={CONNECTED:'bg-success',ERROR:'bg-danger',PENDING:'bg-muted-foreground'};
const statusText:Record<string,string>={CONNECTED:'text-success',ERROR:'text-danger',PENDING:'text-muted-foreground'};

const logCols: Column[] = [
  {key:'timestamp',label:'Timestamp',render:v=><span className="font-mono text-xs">{v}</span>},
  {key:'type',label:'Type',render:v=><span className="pill pill-info">{v}</span>},
  {key:'records',label:'Records'},
  {key:'status',label:'Status',render:v=><span className={`pill ${v==='SUCCESS'?'pill-paid':v==='FAILED'?'pill-overdue':'pill-pending'}`}>{v}</span>},
  {key:'duration',label:'Duration',render:v=><span className="text-muted-foreground">{v}</span>},
  {key:'message',label:'Message',render:(v,row)=><span className={row.status==='FAILED'?'text-danger':' text-muted-foreground'}>{v}</span>},
];

export default function ErpPage() {
  const [selected, setSelected] = useState('1');
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">ERP Integrations</h1><p className="text-xs text-muted-foreground mt-0.5">Connect, sync, and monitor your ERP systems</p></div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>Add Connector</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {CONNECTORS.map(c => (
          <div key={c.id} onClick={() => setSelected(c.id)} className={cn('panel p-4 cursor-pointer transition-all', selected===c.id && 'ring-2 ring-brand-500')}>
            <div className="flex items-center justify-between mb-2">
              <div className="px-2 py-1 bg-secondary rounded text-xs font-bold text-muted-foreground">{c.type}</div>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-2 h-2 rounded-full', statusDot[c.status])}/>
                <span className={cn('text-xs', statusText[c.status])}>{c.status}</span>
              </div>
            </div>
            <div className="text-sm font-semibold mb-1">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.lastSync ? `Last sync: ${c.lastSync}` : 'Not configured'}</div>
            {c.errors > 0 && <div className="text-xs text-danger mt-1">⚠ {c.errors} failed records</div>}
            <div className="flex gap-2 mt-3">
              {c.status === 'CONNECTED' && <button className="flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><RefreshCw className="w-3 h-3"/>Sync</button>}
              {c.status === 'PENDING' && <button className="flex items-center gap-1 px-2 py-1 text-xs bg-brand-500 text-white rounded hover:bg-brand-600">Connect</button>}
              {c.type === 'CSV' && <button className="flex items-center gap-1 px-2 py-1 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Upload className="w-3 h-3"/>Upload</button>}
              <button className="px-2 py-1 text-xs border border-border rounded hover:border-brand-500">Config</button>
            </div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-header"><span>Sync Logs — {CONNECTORS.find(c=>c.id===selected)?.name}</span></div>
        <DataTable columns={logCols} data={LOGS} total={LOGS.length} />
      </div>
    </div>
  );
}
