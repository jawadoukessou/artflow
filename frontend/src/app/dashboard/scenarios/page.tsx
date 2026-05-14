'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';

const SCENARIOS = [
  {id:'s3',name:'Scenario 3 — High Risk',customers:38,steps:8,active:true},
  {id:'s2',name:'Scenario 2 — Standard',customers:182,steps:6,active:true},
  {id:'s1',name:'Scenario 1 — Low Risk',customers:122,steps:4,active:true},
  {id:'s4',name:'Scenario 4 — Public Sector',customers:18,steps:5,active:false},
];

const STEPS = [
  {n:1,type:'EMAIL',day:0,desc:'Template: "1st reminder — firm" · Automatic',badge:'Auto',bc:'bg-brand-50 text-brand-700'},
  {n:2,type:'CALL TASK',day:7,desc:'Assign task to collector: follow-up call · Priority HIGH',badge:'Manual',bc:'bg-warning-light text-warning-dark'},
  {n:3,type:'EMAIL',day:14,desc:'Template: "2nd reminder — formal" · Automatic · CC: collector',badge:'Auto',bc:'bg-brand-50 text-brand-700'},
  {n:4,type:'SMS',day:21,desc:'Template: "Urgent payment reminder" · Automatic',badge:'Auto',bc:'bg-brand-50 text-brand-700'},
  {n:5,type:'EMAIL',day:30,desc:'Template: "Formal notice — pre-legal" · Confirmation required',badge:'Confirm',bc:'bg-warning-light text-warning-dark'},
  {n:6,type:'CREDIT HOLD',day:35,desc:'Automatically suspend new orders · Notify sales team',badge:'Auto',bc:'bg-danger-light text-danger-dark'},
  {n:7,type:'LETTER',day:45,desc:'Registered letter — final formal demand',badge:'Confirm',bc:'bg-warning-light text-warning-dark'},
  {n:8,type:'LEGAL',day:60,desc:'Transfer to legal department · Create legal case',badge:'Manual',bc:'bg-danger-light text-danger-dark'},
];

export default function ScenariosPage() {
  const [active, setActive] = useState('s3');
  const scenario = SCENARIOS.find(s => s.id === active)!;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Collection Scenarios</h1>
          <p className="text-xs text-muted-foreground mt-0.5">4 active scenarios · 1,240 executions this month</p></div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>New Scenario</button>
      </div>
      <div className="grid grid-cols-[240px_1fr] gap-4">
        <div className="panel p-2">
          <div className="text-2xs font-bold text-muted-foreground uppercase tracking-widest px-2 py-2">Scenarios</div>
          {SCENARIOS.map(s => (
            <div key={s.id} onClick={() => setActive(s.id)}
              className={`cursor-pointer px-3 py-2.5 rounded mb-1 transition-colors ${active===s.id ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-secondary'}`}>
              <div className={`text-sm font-semibold ${active===s.id ? 'text-brand-600' : ''}`}>{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.customers} customers · {s.steps} steps · {s.active ? '✅ Active' : '⏸ Paused'}</div>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-header">
            <span className="flex items-center gap-2">{scenario.name} <span className="pill pill-paid text-2xs">ACTIVE</span></span>
            <div className="flex gap-2">
              <button className="px-2 py-1 text-xs border border-border rounded hover:border-brand-500">Edit</button>
              <button className="px-2 py-1 text-xs border border-border rounded hover:border-brand-500">Pause</button>
              <button className="px-2 py-1 text-xs border border-border rounded hover:border-brand-500">Duplicate</button>
            </div>
          </div>
          <div className="panel-body">
            <div className="text-xs text-muted-foreground mb-4">Applied to: Risk D & E customers · {scenario.customers} customers · Trigger: Invoice overdue &gt; 0 days</div>
            <div className="space-y-2">
              {STEPS.map(s => (
                <div key={s.n} className="flex items-start gap-3 p-3 bg-secondary/40 border border-border rounded">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{s.n}</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-brand-600">{s.type} — Day {s.day}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                  <span className={`text-2xs font-bold px-2 py-0.5 rounded ${s.bc}`}>{s.badge}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center text-xs text-muted-foreground">
              Running on {scenario.customers} accounts · ~{scenario.customers * 32} executions/month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
