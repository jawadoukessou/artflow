'use client';
import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';

const USERS = [
  {id:'1',name:'John Doe',email:'admin@acmecorp.com',role:'Admin',status:'Active',lastLogin:'Today'},
  {id:'2',name:'Sarah Martin',email:'s.martin@acmecorp.com',role:'Collector',status:'Active',lastLogin:'Today'},
  {id:'3',name:'Marc Dupont',email:'m.dupont@acmecorp.com',role:'Collector',status:'Active',lastLogin:'Yesterday'},
  {id:'4',name:'Anne Noel',email:'a.noel@acmecorp.com',role:'Analyst',status:'Inactive',lastLogin:'3d ago'},
];

const SETTINGS = [
  {label:'Multi-Factor Authentication',desc:'Require MFA for all users',on:true},
  {label:'AI Email Generation',desc:'Auto-generate collection emails with AI',on:true},
  {label:'Automatic Escalation',desc:'Escalate to legal after 90 days',on:true},
  {label:'ERP Real-time Sync',desc:'Live sync with SAP and Oracle',on:true},
  {label:'GDPR Mode',desc:'Enable data anonymization on deletion',on:true},
  {label:'Audit Trail',desc:'Log all user actions for compliance',on:true},
];

export default function AdminPage() {
  const [settings, setSettings] = useState(SETTINGS.map(s=>({...s})));
  const toggle = (i: number) => setSettings(s => s.map((x,j) => j===i?{...x,on:!x.on}:x));
  const roleColors: Record<string,string> = {Admin:'pill-info',Collector:'pill-partial',Analyst:'pill-pending'};
  const statusColors: Record<string,string> = {Active:'pill-paid',Inactive:'pill-overdue'};

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Administration</h1><p className="text-xs text-muted-foreground mt-0.5">Users · Settings · Security · API</p></div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600"><Plus className="w-3.5 h-3.5"/>Invite User</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-header"><span>👥 User Management</span></div>
          <table className="w-full data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th></th></tr></thead>
            <tbody>
              {USERS.map(u => (
                <tr key={u.id}>
                  <td className="font-semibold">{u.name}</td>
                  <td className="text-muted-foreground text-xs">{u.email}</td>
                  <td><span className={`pill ${roleColors[u.role]||'pill-pending'}`}>{u.role}</span></td>
                  <td><span className={`pill ${statusColors[u.status]||'pill-pending'}`}>{u.status}</span></td>
                  <td className="text-muted-foreground">{u.lastLogin}</td>
                  <td><button className="p-1 hover:text-brand-500"><Edit className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <div className="panel-header"><span>⚙ System Settings</span></div>
          <div className="panel-body divide-y divide-border/60">
            {settings.map((s,i) => (
              <div key={s.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                <button onClick={() => toggle(i)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${s.on ? 'bg-brand-500' : 'bg-border'}`}>
                  <span className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${s.on ? 'left-5' : 'left-0.5'}`}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-header"><span>🔑 API Keys</span></div>
        <div className="panel-body">
          <div className="flex items-center justify-between p-3 bg-secondary rounded mb-2">
            <div><div className="text-sm font-semibold">Production API Key</div><div className="font-mono text-xs text-muted-foreground mt-1">sk-prod-•••••••••••••••••••••••••••••••••XhK8</div></div>
            <div className="flex gap-2"><button className="px-2 py-1 text-xs border border-border rounded hover:border-brand-500">Copy</button><button className="px-2 py-1 text-xs border border-danger text-danger rounded hover:bg-danger-light">Revoke</button></div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Plus className="w-3.5 h-3.5"/>Generate new key</button>
        </div>
      </div>
    </div>
  );
}
