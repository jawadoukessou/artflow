'use client';
import { Plus, Mail, MessageSquare } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { formatDate, cn } from '@/lib/utils';

const COMMS = [
  {id:'1',type:'EMAIL',direction:'OUT',customer:'Omega Group',subject:'3rd reminder — INV-2041',status:'OPENED',date:'2026-05-05',user:'S. Martin'},
  {id:'2',type:'EMAIL',direction:'IN',customer:'Omega Group',subject:'RE: 3rd reminder — payment processing',status:'RECEIVED',date:'2026-05-05',user:''},
  {id:'3',type:'EMAIL',direction:'OUT',customer:'Vertex Inc',subject:'2nd reminder — INV-2038',status:'DELIVERED',date:'2026-05-06',user:'M. Dupont'},
  {id:'4',type:'PHONE',direction:'OUT',customer:'Omega Group',subject:'Call: promised payment by end of month',status:'LOGGED',date:'2026-05-03',user:'S. Martin'},
  {id:'5',type:'SMS',direction:'OUT',customer:'BlueStar Ltd',subject:'Urgent: invoice INV-2024 overdue',status:'DELIVERED',date:'2026-05-04',user:'Auto'},
  {id:'6',type:'EMAIL',direction:'OUT',customer:'Kestrel Ltd',subject:'Payment confirmation — INV-2033',status:'OPENED',date:'2026-05-08',user:'Auto'},
];
const typeIcon:Record<string,string>={EMAIL:'✉',PHONE:'📞',SMS:'📱',LETTER:'📬'};
const statusColors:Record<string,string>={OPENED:'text-success',DELIVERED:'text-brand-500',RECEIVED:'text-purple-600',LOGGED:'text-muted-foreground',FAILED:'text-danger'};

export default function CommunicationsPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Communications</h1><p className="text-xs text-muted-foreground mt-0.5">Email · SMS · Phone · Letters</p></div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Mail className="w-3.5 h-3.5"/>New Email</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>Log Action</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <KpiCard label="Sent MTD" value="248" sub="all channels" color="blue"/>
        <KpiCard label="Open Rate" value="68.4%" trend={-5.2} color="green"/>
        <KpiCard label="Response Rate" value="31.2%" color="amber"/>
        <KpiCard label="Automations" value="184" sub="this month" color="purple"/>
      </div>
      <div className="panel">
        <div className="panel-header"><span>Communication History</span></div>
        <div className="divide-y divide-border/60">
          {COMMS.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-base flex-shrink-0">{typeIcon[c.type]||'📄'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{c.subject}</div>
                <div className="text-xs text-muted-foreground">{c.customer} · {c.direction === 'OUT' ? 'Outbound' : 'Inbound'} · {c.user || 'Automated'}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={cn('text-xs font-semibold', statusColors[c.status])}>{c.status}</div>
                <div className="text-2xs text-muted-foreground mt-0.5">{formatDate(c.date)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
