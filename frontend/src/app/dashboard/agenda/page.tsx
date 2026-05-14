'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckSquare } from 'lucide-react';
import { tasksApi } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

const MOCK_TASKS = [
  {id:'1',title:'Call Omega Group — overdue €84,200',customer:'Omega Group',type:'CALL',priority:'CRITICAL',status:'PENDING',dueAt:new Date().toISOString(),amount:84200},
  {id:'2',title:'Email Vertex Inc — 2nd formal reminder',customer:'Vertex Inc',type:'EMAIL',priority:'HIGH',status:'PENDING',dueAt:new Date().toISOString(),amount:42100},
  {id:'3',title:'Legal escalation — Omega INV-1942',customer:'Omega Group',type:'LEGAL',priority:'CRITICAL',status:'IN_PROGRESS',dueAt:new Date().toISOString(),amount:40000},
  {id:'4',title:'Dispute review — Apex Trading',customer:'Apex Trading',type:'DISPUTE',priority:'MEDIUM',status:'PENDING',dueAt:new Date(Date.now()+86400000).toISOString(),amount:7850},
  {id:'5',title:'Payment plan — Nexus Corp',customer:'Nexus Corp',type:'MEETING',priority:'MEDIUM',status:'PENDING',dueAt:new Date(Date.now()+86400000*3).toISOString(),amount:22000},
  {id:'6',title:'Monthly KPI report export',customer:'—',type:'REPORT',priority:'LOW',status:'PENDING',dueAt:new Date(Date.now()+86400000*2).toISOString(),amount:0},
  {id:'7',title:'Payment confirmed — Kestrel Ltd',customer:'Kestrel Ltd',type:'EMAIL',priority:'LOW',status:'COMPLETED',dueAt:new Date().toISOString(),amount:12400},
];
const PC:Record<string,string>={CRITICAL:'text-danger',HIGH:'text-orange-500',MEDIUM:'text-warning',LOW:'text-success'};
const PD:Record<string,string>={CRITICAL:'bg-danger',HIGH:'bg-orange-500',MEDIUM:'bg-warning',LOW:'bg-success'};

export default function AgendaPage() {
  const [done, setDone] = useState<Set<string>>(new Set(['7']));
  const urgent = MOCK_TASKS.filter(t => ['CRITICAL','HIGH'].includes(t.priority) && !done.has(t.id));
  const scheduled = MOCK_TASKS.filter(t => !['CRITICAL','HIGH'].includes(t.priority) || done.has(t.id));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold flex items-center gap-2"><CheckSquare className="w-5 h-5 text-brand-500"/>Collection Agenda</h1>
          <p className="text-xs text-muted-foreground mt-0.5">May 2026 · {MOCK_TASKS.filter(t=>!done.has(t.id)).length} actions pending</p></div>
        <div className="flex gap-2">
          <select className="form-select text-xs"><option>My actions</option><option>All collectors</option></select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>Add action</button>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_300px] gap-4">
        <div className="space-y-3">
          <div className="panel">
            <div className="panel-header" style={{color:'#d94040'}}><span className="flex items-center gap-1.5 text-danger">⚠ Urgent actions ({urgent.length})</span></div>
            <div className="panel-body divide-y divide-border/60">
              {urgent.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', PD[t.priority])}/>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.customer} · {t.amount > 0 ? `€${t.amount.toLocaleString()}` : ''}</div>
                  </div>
                  <span className={cn('text-xs font-bold', PC[t.priority])}>{t.priority}</span>
                  <button onClick={() => setDone(d => new Set([...d, t.id]))}
                    className="px-3 py-1 text-xs bg-brand-500 text-white rounded hover:bg-brand-600">Done</button>
                </div>
              ))}
              {urgent.length === 0 && <div className="py-6 text-center text-sm text-success font-medium">✅ All urgent actions completed!</div>}
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><span>Scheduled actions</span></div>
            <div className="panel-body divide-y divide-border/60">
              {scheduled.map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', done.has(t.id) ? 'bg-success' : PD[t.priority])}/>
                  <div className="flex-1">
                    <div className={cn('text-sm font-medium', done.has(t.id) && 'line-through text-muted-foreground')}>{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.customer} · {formatDate(t.dueAt)}</div>
                  </div>
                  {done.has(t.id) ? <span className="text-xs font-bold text-success">DONE</span> :
                    <><span className={cn('text-xs font-bold', PC[t.priority])}>{t.priority}</span>
                    <button onClick={() => setDone(d => new Set([...d, t.id]))} className="px-2 py-1 text-xs border border-border rounded hover:border-brand-500">Done</button></>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="panel">
            <div className="panel-header"><span>📊 May 2026 Summary</span></div>
            <div className="panel-body space-y-1.5">
              {[['Total actions','248'],['Emails sent','184'],['Phone calls','38'],['SMS sent','14'],['Promises to pay','22'],['Completion rate','91.4%']].map(([l,v]) => (
                <div key={l} className="flex justify-between text-xs py-1 border-b border-border/60 last:border-0">
                  <span className="text-muted-foreground">{l}</span><span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><span>✉ Quick Email</span></div>
            <div className="panel-body space-y-3">
              <div><label className="form-label">Customer</label>
                <select className="form-select w-full"><option>Omega Group</option><option>Vertex Inc</option><option>BlueStar Ltd</option></select></div>
              <div><label className="form-label">Template</label>
                <select className="form-select w-full"><option>3rd reminder — firm</option><option>1st reminder</option><option>Formal notice</option></select></div>
              <div><label className="form-label">Invoice</label>
                <input className="form-input" defaultValue="INV-2041 (€84,200)"/></div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs border border-border rounded hover:border-brand-500">Preview</button>
                <button className="flex-1 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600">Send now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
