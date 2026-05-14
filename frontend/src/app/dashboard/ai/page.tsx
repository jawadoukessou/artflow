'use client';
import { Brain, Zap } from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { formatCurrency, getRiskBadgeClasses, cn } from '@/lib/utils';

const PREDICTIONS = [
  {id:'1',customer:'Omega Group',outstanding:284200,lateProbability:78,defaultRisk:'CRITICAL',recommendation:'Suspend credit, escalate legal immediately'},
  {id:'2',customer:'Vertex Inc',outstanding:198500,lateProbability:62,defaultRisk:'HIGH',recommendation:'Schedule urgent call, request payment plan'},
  {id:'3',customer:'BlueStar Ltd',outstanding:145000,lateProbability:45,defaultRisk:'HIGH',recommendation:'Send personalized email, monitor closely'},
  {id:'4',customer:'Nexus Corp',outstanding:223000,lateProbability:31,defaultRisk:'MEDIUM',recommendation:'Send reminder, update payment plan'},
  {id:'5',customer:'Apex Trading',outstanding:78400,lateProbability:22,defaultRisk:'MEDIUM',recommendation:'Standard reminder, no immediate action needed'},
];

export default function AiPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-purple-500"/>AI Insights</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Machine learning — payment prediction · risk scoring · smart prioritization</p></div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <KpiCard label="Model Accuracy" value="91.4%" sub="payment prediction" color="purple"/>
        <KpiCard label="High Risk Detected" value="38" sub="customers flagged" color="red"/>
        <KpiCard label="Late Payment Risk" value="€1.12M" sub="next 30 days" color="amber"/>
        <KpiCard label="AI Actions Taken" value="284" sub="this month" color="green"/>
        <KpiCard label="Emails Generated" value="1,240" sub="by AI this month" color="blue"/>
      </div>
      <div className="panel">
        <div className="panel-header"><span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-purple-500"/>AI Payment Predictions — Top At-Risk Accounts</span></div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead><tr><th>Customer</th><th>Outstanding</th><th>Late Probability</th><th>Risk</th><th>AI Recommendation</th><th></th></tr></thead>
            <tbody>
              {PREDICTIONS.map(p => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.customer}</td>
                  <td className="font-semibold">{formatCurrency(p.outstanding)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded overflow-hidden min-w-[80px]">
                        <div className="h-full rounded" style={{width:`${p.lateProbability}%`,background:p.lateProbability>60?'#d94040':p.lateProbability>30?'#f0a500':'#2eab6f'}}/>
                      </div>
                      <span className={cn('text-xs font-bold',p.lateProbability>60?'text-danger':p.lateProbability>30?'text-warning':'text-success')}>{p.lateProbability}%</span>
                    </div>
                  </td>
                  <td><span className={cn('pill',getRiskBadgeClasses(p.defaultRisk))}>{p.defaultRisk}</span></td>
                  <td className="text-xs text-muted-foreground max-w-xs">{p.recommendation}</td>
                  <td><button className="px-2 py-1 text-xs border border-border rounded hover:border-brand-500 hover:text-brand-500">Apply</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="panel">
          <div className="panel-header"><span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-purple-500"/>AI Generated Email Preview</span></div>
          <div className="panel-body">
            <div className="p-3 bg-purple-50 border border-purple-100 rounded text-xs leading-relaxed">
              <div className="font-semibold text-purple-700 mb-2">Generated for: Omega Group · INV-2041</div>
              <div className="text-gray-700">
                <strong>Subject:</strong> Important: Invoice INV-2041 — Immediate Action Required<br/><br/>
                Dear Mr. Durand,<br/><br/>
                We are writing regarding invoice INV-2041 (€84,200) which is now <strong>45 days past due</strong>. Despite our previous reminders, no payment has been received.<br/><br/>
                Please arrange full payment or contact us within <strong>5 business days</strong> to avoid further escalation.<br/><br/>
                Best regards,<br/>Sarah Martin, Credit Manager
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-1.5 text-xs border border-border rounded hover:border-brand-500">Edit</button>
              <button className="flex-1 py-1.5 text-xs bg-brand-500 text-white rounded hover:bg-brand-600">Send Email</button>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><span>Model Performance</span></div>
          <div className="panel-body space-y-3">
            {[['Precision','93.2%','text-success'],['Recall','89.8%','text-success'],['F1 Score','91.4%','text-success'],['Training data','24,841 invoices','text-foreground'],['Last retrained','May 1, 2026','text-muted-foreground'],['Model version','v2.4.1','text-muted-foreground']].map(([l,v,c])=>(
              <div key={l as string} className="flex justify-between text-sm border-b border-border/60 last:border-0 pb-2 last:pb-0">
                <span className="text-muted-foreground">{l}</span><span className={cn('font-semibold',c)}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
