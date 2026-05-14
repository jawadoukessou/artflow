'use client';
import { KpiCard } from '@/components/shared/KpiCard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const PAYMENTS = [
  {id:'1',reference:'PAY-2890',customer:'Kestrel Ltd',invoice:'INV-2033',amount:12400,method:'BANK_TRANSFER',status:'CONFIRMED',paidAt:'2026-05-08',erpRef:'SAP-P8812'},
  {id:'2',reference:'PAY-2889',customer:'Solaris SA',invoice:'INV-2039',amount:98000,method:'BANK_TRANSFER',status:'CONFIRMED',paidAt:'2026-05-06',erpRef:'SAP-P8811'},
  {id:'3',reference:'PAY-2888',customer:'Titan Pharma',invoice:'INV-2040',amount:220000,method:'BANK_TRANSFER',status:'CONFIRMED',paidAt:'2026-05-03',erpRef:'SAP-P8810'},
  {id:'4',reference:'PAY-2887',customer:'Nexus Corp',invoice:'INV-2029',amount:10000,method:'DIRECT_DEBIT',status:'CONFIRMED',paidAt:'2026-05-01',erpRef:'DYN-P3300'},
  {id:'5',reference:'PAY-2886',customer:'Vertex Inc',invoice:'INV-2038',amount:20000,method:'BANK_TRANSFER',status:'CONFIRMED',paidAt:'2026-04-28',erpRef:'ORC-P4400'},
];
const methodLabel:Record<string,string>={BANK_TRANSFER:'Bank Transfer',DIRECT_DEBIT:'Direct Debit',CREDIT_CARD:'Credit Card',CHECK:'Check'};
const cols: Column[] = [
  {key:'reference',label:'Reference',render:v=><span className="font-semibold text-brand-500">{v}</span>},
  {key:'customer',label:'Customer',render:v=><span className="font-medium">{v}</span>},
  {key:'invoice',label:'Invoice',render:v=><span className="text-brand-500">{v}</span>},
  {key:'amount',label:'Amount',render:v=><span className="font-bold text-success">{formatCurrency(v)}</span>},
  {key:'method',label:'Method',render:v=><span className="text-muted-foreground">{methodLabel[v]||v}</span>},
  {key:'status',label:'Status',render:v=><span className="pill pill-paid">{v}</span>},
  {key:'paidAt',label:'Date',render:v=><span className="text-muted-foreground">{formatDate(v)}</span>},
  {key:'erpRef',label:'ERP Ref',render:v=><span className="font-mono text-xs text-muted-foreground">{v}</span>},
];

export default function PaymentsPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Payments</h1><p className="text-xs text-muted-foreground mt-0.5">Payment tracking and reconciliation</p></div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600">+ Log Payment</button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Collected MTD" value="€8.91M" trend={-12.4} color="green"/>
        <KpiCard label="Pending" value="€680k" sub="34 payments" color="amber"/>
        <KpiCard label="Bounced" value="€22k" sub="3 payments" color="red"/>
        <KpiCard label="On-Time Rate" value="61.2%" trend={-4.2} color="blue"/>
      </div>
      <div className="panel">
        <div className="panel-header"><span>Recent Payments</span></div>
        <DataTable columns={cols} data={PAYMENTS} total={PAYMENTS.length} selectable />
      </div>
    </div>
  );
}
