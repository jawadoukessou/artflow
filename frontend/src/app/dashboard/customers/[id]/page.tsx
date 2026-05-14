'use client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Ban, Gavel, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate, getRiskBadgeClasses, getRiskLabel, getStatusBadgeClasses, getStatusLabel, cn } from '@/lib/utils';

const MOCK = {
  id:'1', name:'Omega Group SAS', code:'OMG-001', country:'FR', city:'Paris',
  creditLimit:500000, website:'omega-group.fr', vatNumber:'FR12345678901',
  erpReference:'SAP-C004821', paymentTerms:30, segment:'KEY_ACCOUNT', industry:'Manufacturing',
  collector:{firstName:'Sarah',lastName:'Martin',email:'s.martin@acmecorp.com'},
  contacts:[{id:'c1',firstName:'Jean',lastName:'Durand',role:'Finance Director',email:'j.durand@omega-group.fr',phone:'+33 1 40 00 10 20'}],
  riskScores:[{score:87,level:'CRITICAL',dso:78,avgPaymentDelay:45,overdueRatio:0.42}],
  stats:{outstandingBalance:284200,overdueBalance:84200,totalInvoiced:1240000,totalPaid:955800,dso:78},
  invoices:[
    {id:'i1',number:'INV-2041',issueDate:'2026-03-15',dueDate:'2026-04-15',amount:84200,amountPaid:0,amountDue:84200,status:'OVERDUE'},
    {id:'i2',number:'INV-2028',issueDate:'2026-03-01',dueDate:'2026-05-01',amount:160000,amountPaid:0,amountDue:160000,status:'PENDING'},
    {id:'i3',number:'INV-2010',issueDate:'2026-02-15',dueDate:'2026-03-15',amount:72400,amountPaid:40000,amountDue:32400,status:'PARTIALLY_PAID'},
    {id:'i4',number:'INV-1988',issueDate:'2026-02-01',dueDate:'2026-03-01',amount:95000,amountPaid:95000,amountDue:0,status:'PAID'},
    {id:'i5',number:'INV-1942',issueDate:'2026-01-01',dueDate:'2026-02-01',amount:40000,amountPaid:0,amountDue:40000,status:'LEGAL'},
  ],
  communications:[
    {id:'c1',type:'EMAIL',direction:'OUTBOUND',subject:'3rd reminder — INV-2041',status:'OPENED',createdAt:'2026-05-05'},
    {id:'c2',type:'PHONE',direction:'OUTBOUND',subject:'Call: customer promises payment by end of month',status:'LOGGED',createdAt:'2026-05-03'},
    {id:'c3',type:'EMAIL',direction:'OUTBOUND',subject:'2nd reminder — INV-2041',status:'DELIVERED',createdAt:'2026-04-22'},
    {id:'c4',type:'EMAIL',direction:'INBOUND',subject:'RE: 2nd reminder — payment being processed',status:'RECEIVED',createdAt:'2026-04-22'},
  ],
};

const agingRows = [
  {label:'Not yet due',amount:160000,pct:56.3,color:'#007fb1'},
  {label:'1–30 days',amount:40000,pct:14.1,color:'#f0a500'},
  {label:'31–60 days',amount:28000,pct:9.8,color:'#d96000'},
  {label:'61–90 days',amount:16200,pct:5.7,color:'#d94040'},
  {label:'> 90 days',amount:40000,pct:14.1,color:'#8b0000'},
];

export default function CustomerProfilePage() {
  const { id } = useParams<{id:string}>();
  const router = useRouter();
  const c = MOCK;
  const risk = c.riskScores[0];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1.5"><ArrowLeft className="w-3.5 h-3.5"/>Back</button>
          <h1 className="text-xl font-bold flex items-center gap-2">{c.name}<span className={cn('pill',getRiskBadgeClasses(risk.level))}>{getRiskLabel(risk.level)}</span></h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Mail className="w-3.5 h-3.5"/>Send Reminder</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Phone className="w-3.5 h-3.5"/>Log Call</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-danger text-danger rounded hover:bg-danger-light"><Ban className="w-3.5 h-3.5"/>Suspend</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>Add Action</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body flex gap-4 items-start">
          <div className="w-14 h-14 rounded-lg bg-brand-50 flex items-center justify-center text-xl font-black text-brand-500 flex-shrink-0">{c.name.slice(0,2).toUpperCase()}</div>
          <div className="flex-1">
            <div className="text-lg font-bold">{c.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{c.industry} · {c.city}, {c.country}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span>🌐 {c.website}</span><span>🏛 {c.vatNumber}</span>
              <span>🔗 ERP: {c.erpReference}</span>
              <span>👤 {c.collector.firstName} {c.collector.lastName}</span>
              <span>📅 Terms: {c.paymentTerms} days</span>
            </div>
          </div>
          <div className="text-right text-xs"><div className="text-muted-foreground">Segment</div><div className="font-semibold mt-0.5">{c.segment.replace('_',' ')}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="panel">
              <div className="panel-header"><span>💰 Financial Summary</span></div>
              <div className="panel-body space-y-1.5">
                {[
                  ['Credit limit', formatCurrency(c.creditLimit), ''],
                  ['Outstanding', formatCurrency(c.stats.outstandingBalance), 'text-warning'],
                  ['Overdue', formatCurrency(c.stats.overdueBalance), 'text-danger'],
                  ['Utilization', `${((c.stats.outstandingBalance/c.creditLimit)*100).toFixed(1)}%`, 'text-warning'],
                  ['Invoiced (YTD)', formatCurrency(c.stats.totalInvoiced), ''],
                  ['Paid (YTD)', formatCurrency(c.stats.totalPaid), 'text-success'],
                  ['DSO', `${c.stats.dso}d`, 'text-danger'],
                ].map(([l,v,col]) => (
                  <div key={l} className="flex justify-between text-xs py-1 border-b border-border/60 last:border-0">
                    <span className="text-muted-foreground">{l}</span><span className={cn('font-semibold',col)}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header"><span>📊 Aging Balance</span></div>
              <div className="panel-body space-y-2">
                {agingRows.map(r => (
                  <div key={r.label} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-20 flex-shrink-0">{r.label}</span>
                    <div className="flex-1 h-3 bg-secondary rounded overflow-hidden">
                      <div className="h-full rounded" style={{width:`${r.pct}%`,background:r.color}}/>
                    </div>
                    <span className="font-semibold w-20 text-right">{formatCurrency(r.amount,'EUR',true)}</span>
                    <span className="text-muted-foreground w-8 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span>📄 Open Invoices</span><Link href="/dashboard/invoices" className="text-2xs text-brand-500 hover:underline">View all</Link></div>
            <table className="w-full data-table">
              <thead><tr><th>Invoice</th><th>Issue</th><th>Due</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {c.invoices.map(inv => (
                  <tr key={inv.id} className={['OVERDUE','LEGAL'].includes(inv.status)?'overdue-row':''}>
                    <td className="text-brand-500 font-semibold">{inv.number}</td>
                    <td className="text-muted-foreground">{formatDate(inv.issueDate)}</td>
                    <td className={cn(inv.status==='OVERDUE'&&'text-danger font-semibold')}>{formatDate(inv.dueDate)}</td>
                    <td className="font-semibold">{formatCurrency(inv.amount)}</td>
                    <td className="text-success">{formatCurrency(inv.amountPaid)}</td>
                    <td className={cn('font-bold',inv.amountDue>0?'text-danger':'text-success')}>{formatCurrency(inv.amountDue)}</td>
                    <td><span className={getStatusBadgeClasses(inv.status)}>{getStatusLabel(inv.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <div className="panel-header"><span>📨 Action History</span></div>
            <div className="panel-body border-l-2 border-border ml-3 space-y-0">
              {c.communications.map((comm,i) => (
                <div key={comm.id} className="relative pl-4 pb-4 last:pb-0">
                  <div className="absolute left-[-5px] w-2.5 h-2.5 rounded-full bg-brand-500 top-0.5"/>
                  <div className="text-xs font-semibold">{comm.type} — {comm.direction === 'OUTBOUND' ? 'Sent' : 'Received'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{comm.subject}</div>
                  <div className="text-2xs text-muted-foreground mt-0.5">{formatDate(comm.createdAt)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="panel">
            <div className="panel-header"><span>🛡 Risk Profile</span></div>
            <div className="panel-body text-center">
              <div className={cn('text-4xl font-black', risk.score>=70?'text-danger':risk.score>=40?'text-warning':'text-success')}>{risk.score}</div>
              <div className="text-xs text-muted-foreground">Risk score / 100</div>
              <div className="mt-2 h-2 bg-gradient-to-r from-success via-warning to-danger rounded-full relative">
                <div className="absolute w-3 h-3 bg-foreground rounded-full top-[-2px] shadow" style={{left:`${risk.score}%`,transform:'translateX(-50%)'}}/>
              </div>
              <span className={cn('pill mt-3 text-xs px-3 py-1 inline-block',getRiskBadgeClasses(risk.level))}>{getRiskLabel(risk.level)}</span>
              <div className="mt-3 space-y-1.5 text-xs">
                {[['DSO',`${risk.dso}d`],['Avg delay',`+${risk.avgPaymentDelay}d`],['Overdue ratio',`${(risk.overdueRatio*100).toFixed(1)}%`]].map(([l,v])=>(
                  <div key={l} className="flex justify-between border-b border-border/60 last:border-0 py-1">
                    <span className="text-muted-foreground">{l}</span><span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><span>⚡ Actions</span></div>
            <div className="panel-body space-y-2">
              {[{icon:Mail,label:'Send formal notice',c:'text-brand-500'},{icon:Phone,label:'Schedule call',c:'text-success'},{icon:Ban,label:'Suspend credit',c:'text-danger'},{icon:Gavel,label:'Escalate legal',c:'text-danger'}].map(a=>(
                <button key={a.label} className="w-full flex items-center gap-2 px-3 py-2 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500">
                  <a.icon className={cn('w-3.5 h-3.5',a.c)}/>{a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><span>👤 Primary Contact</span></div>
            <div className="panel-body">
              <div className="font-semibold text-sm">{c.contacts[0].firstName} {c.contacts[0].lastName}</div>
              <div className="text-xs text-muted-foreground">{c.contacts[0].role}</div>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-brand-500"/>{c.contacts[0].email}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-brand-500"/>{c.contacts[0].phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
