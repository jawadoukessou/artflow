'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import { KpiCard } from '@/components/shared/KpiCard';

const dso = [{m:'Jun',dso:52,t:45},{m:'Jul',dso:50,t:45},{m:'Aug',dso:51,t:45},{m:'Sep',dso:49,t:45},{m:'Oct',dso:53,t:45},{m:'Nov',dso:51,t:45},{m:'Dec',dso:49,t:45},{m:'Jan',dso:48,t:45},{m:'Feb',dso:50,t:45},{m:'Mar',dso:48,t:45},{m:'Apr',dso:47,t:45},{m:'May',dso:47,t:45}];
const aging = [{m:'Jan',nd:5800,d30:1900,d60:1100,d90:800},{m:'Feb',nd:6100,d30:1700,d60:900,d90:700},{m:'Mar',nd:5400,d30:2100,d60:1200,d90:900},{m:'Apr',nd:6200,d30:1800,d60:800,d90:600},{m:'May',nd:6472,d30:2000,d60:900,d90:700}];
const cash = [{m:'Jan',c:7200,t:9000},{m:'Feb',c:8100,t:9000},{m:'Mar',c:8400,t:9000},{m:'Apr',c:8700,t:9000},{m:'May',c:8912,t:9000}];
const country = [{c:'France',v:3200},{c:'Germany',v:2800},{c:'UK',v:1900},{c:'Italy',v:800},{c:'Spain',v:600}];
const collectors = [{n:'Sarah M.',r:94},{n:'Marc D.',r:87},{n:'Anne N.',r:82},{n:'Thomas L.',r:76}];
const risk = [{n:'Low',v:52},{n:'Medium',v:30},{n:'High',v:13},{n:'Critical',v:5}];
const RISK_COLORS = ['#2eab6f','#f0a500','#d94040','#6b1f1f'];
const tip = (props: any) => {
  if (!props.active || !props.payload?.length) return null;
  return <div className="bg-white border border-border rounded shadow p-2 text-xs"><div className="font-semibold mb-1">{props.label}</div>{props.payload.map((p:any,i:number) => <div key={i} className="flex gap-1.5 items-center"><span className="w-2 h-2 rounded-sm inline-block" style={{background:p.color}}/><span className="text-muted-foreground">{p.name}:</span><span className="font-medium">{p.value}</span></div>)}</div>;
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Analytics & Reports</h1><p className="text-xs text-muted-foreground mt-0.5">Real-time · All entities · EUR</p></div>
        <div className="flex gap-2">
          <select className="form-select text-xs"><option>Last 12 months</option><option>YTD 2026</option></select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500"><Download className="w-3.5 h-3.5"/>Export PDF</button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Avg DSO" value="47.3d" trend={2.1} color="blue" />
        <KpiCard label="Collection Rate" value="84.2%" trend={-3.1} color="green" />
        <KpiCard label="Bad Debt Rate" value="1.4%" trend={0.3} color="red" />
        <KpiCard label="Dispute Rate" value="2.8%" trend={-0.5} color="amber" />
        <KpiCard label="On-Time Payment" value="61.2%" trend={-4.2} color="purple" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="panel"><div className="panel-header"><span>Aging Balance — Stacked Monthly (€k)</span></div><div className="panel-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={aging} margin={{top:4,right:8,left:-10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="m" tick={{fontSize:10,fill:'#888'}}/>
              <YAxis tick={{fontSize:10,fill:'#888'}} tickFormatter={v=>`€${v}k`}/>
              <Tooltip content={tip}/>
              <Bar dataKey="nd" name="Not due" stackId="a" fill="#007fb1" radius={[0,0,0,0]}/>
              <Bar dataKey="d30" name="1-30d" stackId="a" fill="#2eab6f"/>
              <Bar dataKey="d60" name="31-60d" stackId="a" fill="#f0a500"/>
              <Bar dataKey="d90" name=">60d" stackId="a" fill="#d94040" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div></div>
        <div className="panel"><div className="panel-header"><span>DSO vs Target (45d)</span></div><div className="panel-body">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dso} margin={{top:4,right:8,left:-10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="m" tick={{fontSize:10,fill:'#888'}}/>
              <YAxis tick={{fontSize:10,fill:'#888'}} tickFormatter={v=>`${v}d`} domain={[38,58]}/>
              <Tooltip content={tip}/>
              <Line type="monotone" dataKey="dso" stroke="#007fb1" strokeWidth={2} dot={{r:3}} name="DSO"/>
              <Line type="monotone" dataKey="t" stroke="#2eab6f" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Target"/>
            </LineChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="panel"><div className="panel-header"><span>Cash Collection vs Target (€k)</span></div><div className="panel-body">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cash} margin={{top:4,right:8,left:-10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="m" tick={{fontSize:10,fill:'#888'}}/>
              <YAxis tick={{fontSize:10,fill:'#888'}} tickFormatter={v=>`€${v}k`}/>
              <Tooltip content={tip}/>
              <Bar dataKey="c" name="Collected" fill="#2eab6f" radius={[2,2,0,0]}/>
              <Bar dataKey="t" name="Target" fill="#007fb120" radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div></div>
        <div className="panel"><div className="panel-header"><span>Outstanding by Country (€k)</span></div><div className="panel-body">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={country} layout="vertical" margin={{top:4,right:8,left:20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" tick={{fontSize:10,fill:'#888'}} tickFormatter={v=>`€${v}k`}/>
              <YAxis dataKey="c" type="category" tick={{fontSize:10,fill:'#555'}}/>
              <Tooltip content={tip}/>
              <Bar dataKey="v" name="Outstanding" fill="#007fb1" radius={[0,2,2,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="panel"><div className="panel-header"><span>Collector Performance (%)</span></div><div className="panel-body">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={collectors} layout="vertical" margin={{top:4,right:8,left:20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis type="number" domain={[0,100]} tick={{fontSize:10,fill:'#888'}} tickFormatter={v=>`${v}%`}/>
              <YAxis dataKey="n" type="category" tick={{fontSize:10,fill:'#555'}}/>
              <Tooltip content={tip}/>
              <Bar dataKey="r" name="Collection rate" fill="#2eab6f" radius={[0,2,2,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div></div>
        <div className="panel"><div className="panel-header"><span>Risk Distribution</span></div><div className="panel-body flex items-center gap-6">
          <ResponsiveContainer width={160} height={160}>
            <PieChart><Pie data={risk} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="v">
              {risk.map((_,i) => <Cell key={i} fill={RISK_COLORS[i]}/>)}
            </Pie></PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {risk.map((r,i) => <div key={r.n} className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-sm" style={{background:RISK_COLORS[i]}}/><span className="text-muted-foreground">{r.n}</span><span className="font-bold ml-auto">{r.v}%</span></div>)}
          </div>
        </div></div>
      </div>
    </div>
  );
}
