'use client';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { formatCurrency, cn } from '@/lib/utils';

const RISK_CUSTOMERS = [
  {id:'1',name:'Omega Group',risk:'CRITICAL',score:87,dso:78,delay:45,overdue:84200,creditLimit:500000,profile:'Very late payer'},
  {id:'2',name:'Vertex Inc',risk:'HIGH',score:72,dso:65,delay:32,overdue:62100,creditLimit:300000,profile:'Late payer'},
  {id:'3',name:'BlueStar Ltd',risk:'HIGH',score:68,dso:58,delay:28,overdue:38000,creditLimit:200000,profile:'Late payer'},
  {id:'4',name:'Nexus Corp',risk:'MEDIUM',score:44,dso:44,delay:14,overdue:22000,creditLimit:400000,profile:'Slightly late'},
  {id:'5',name:'Apex Trading',risk:'MEDIUM',score:41,dso:38,delay:8,overdue:7850,creditLimit:150000,profile:'Slightly late'},
  {id:'6',name:'Helios SRL',risk:'MEDIUM',score:35,dso:40,delay:10,overdue:0,creditLimit:180000,profile:'Generally on time'},
];

const riskDist = [{n:'A',v:18,c:'#1a7a4f'},{n:'B',v:41,c:'#2eab6f'},{n:'C',v:30,c:'#f0a500'},{n:'D',v:9,c:'#d96000'},{n:'E',v:2,c:'#d94040'}];
const riskColors:Record<string,string>={CRITICAL:'text-danger font-bold',HIGH:'text-orange-500 font-bold',MEDIUM:'text-warning font-bold',LOW:'text-success font-bold'};
const riskBg:Record<string,string>={CRITICAL:'bg-danger-light text-danger-dark',HIGH:'bg-orange-100 text-orange-800',MEDIUM:'bg-warning-light text-warning-dark',LOW:'bg-success-light text-success-dark'};

const cols: Column[] = [
  {key:'name',label:'Customer',render:v=><span className="font-semibold text-brand-500 cursor-pointer hover:underline">{v}</span>},
  {key:'risk',label:'Risk Level',render:v=><span className={`pill ${riskBg[v]}`}>{v}</span>},
  {key:'score',label:'Score',render:v=><span className={v>=70?'text-danger font-bold':v>=40?'text-warning font-bold':'text-success font-bold'}>{v}/100</span>},
  {key:'dso',label:'DSO',render:(v,row)=><span className={row.overdue>0?'text-danger':'text-success'}>{v}d</span>},
  {key:'delay',label:'Avg Delay',render:v=><span className={v>0?'text-warning':'text-success'}>{v>0?`+${v}d`:`${v}d`}</span>},
  {key:'overdue',label:'Overdue',render:v=><span className={v>0?'text-danger font-bold':'text-success'}>{formatCurrency(v)}</span>},
  {key:'creditLimit',label:'Credit Limit',render:v=>formatCurrency(v)},
  {key:'profile',label:'Payer Profile',render:v=><span className="text-muted-foreground">{v}</span>},
];

export default function RiskPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Risk Analysis & Credit Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time risk scores · Credit limits · Payer profiles</p></div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Download className="w-3.5 h-3.5"/>Export Risk Report</button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Critical (E)" value="8" sub="€284k at risk" color="red"/>
        <KpiCard label="High Risk (D)" value="30" sub="€840k at risk" color="amber"/>
        <KpiCard label="Medium (C)" value="102" sub="€1.2M" color="blue"/>
        <KpiCard label="Low Risk (B)" value="142" sub="€4.8M" color="green"/>
        <KpiCard label="Excellent (A)" value="60" sub="€2.6M" color="green"/>
      </div>
      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div>
          <div className="panel">
            <div className="panel-header"><span>Risk Watchlist — D & E customers</span><span className="text-xs text-muted-foreground font-normal">38 customers</span></div>
            <DataTable columns={cols} data={RISK_CUSTOMERS} total={RISK_CUSTOMERS.length} selectable />
          </div>
        </div>
        <div className="space-y-3">
          <div className="panel">
            <div className="panel-header"><span>Risk Distribution</span></div>
            <div className="panel-body">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={riskDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="v">
                  {riskDist.map(r=><Cell key={r.n} fill={r.c}/>)}
                </Pie></PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {riskDist.map(r=><div key={r.n} className="flex items-center gap-1.5 text-xs"><span className="w-3 h-3 rounded-sm" style={{background:r.c}}/><span className="text-muted-foreground">{r.n}</span><span className="font-bold">{r.v}%</span></div>)}
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><span>Credit Limit Alerts</span></div>
            <div className="panel-body space-y-1.5">
              {[['Omega Group','56.8%','text-warning'],['Vertex Inc','66.2%','text-danger'],['Nexus Corp','55.8%','text-warning'],['BlueStar Ltd','72.5%','text-danger'],['Titan Pharma','72.0%','text-success']].map(([n,v,c])=>(
                <div key={n as string} className="flex justify-between text-xs py-1 border-b border-border/60 last:border-0">
                  <span className="text-muted-foreground">{n}</span><span className={`font-bold ${c}`}>{v} utilized</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
