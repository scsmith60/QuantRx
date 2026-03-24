import { MoreHorizontal, Download, AlertCircle } from 'lucide-react';
import { attributionEngine } from '../services/attributionEngine';

const MOCK_PRACTICES = [
  { id: '1', name: 'Oncology Associates of NJ', lift: 124500, fee: 18675, status: 'Connected', patients: 142 },
  { id: '2', name: 'Texas Cancer Specialists', lift: 450000, fee: 67500, status: 'Connected', patients: 521 },
  { id: '3', name: 'Florida Oncology Group', lift: 89000, fee: 13350, status: 'Pending BAA', patients: 98 },
  { id: '4', name: 'Seattle Cancer Care', lift: 210000, fee: 31500, status: 'Connected', patients: 234 },
];

const GlobalMarginView: React.FC = () => {
  const attributions = attributionEngine.getAttributions();
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {attributions.length > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between animate-pulse">
           <div className="flex items-center space-x-3 text-primary">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">New Attribute Detected: {attributions.length} Switch(es) Found in EHR</span>
           </div>
           <button className="text-[10px] font-bold underline">Review Claims</button>
        </div>
      )}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Global Margin View</h2>
          <p className="text-muted-foreground italic">"Tracking the 15% Lift across your empire."</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-secondary text-sm font-medium rounded-lg border border-border flex items-center space-x-2">
             <Download className="w-4 h-4" />
             <span>Export Report</span>
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-transform active:scale-95">
             Generate All Invoices
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Network Practices', value: '42', delta: '+3 this month' },
          { label: 'Total Patient Volume', value: '18.4k', delta: '+1.2% vol' },
          { label: 'Total Lift Detected', value: '$8.4M', delta: '+$240k vs Feb' },
          { label: 'QuantRx Fee (15%)', value: '$1.26M', delta: '+$36k vs Feb', color: 'text-primary' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-xl border border-border glass-panel">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">{stat.label}</p>
            <p className={`text-2xl font-mono font-bold ${stat.color || ''}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border glass-panel overflow-hidden">
        <table className="w-full text-left">
           <thead>
             <tr className="bg-secondary/30 border-b border-border">
               <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Practice Name</th>
               <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">Status</th>
               <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">Total Lift</th>
               <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">Fee (15%)</th>
               <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-center">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-border/50">
             {MOCK_PRACTICES.map((p) => (
               <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                 <td className="px-6 py-4">
                   <p className="font-semibold text-sm">{p.name}</p>
                   <p className="text-[10px] text-muted-foreground">{p.patients} active patients tracked</p>
                 </td>
                 <td className="px-6 py-4">
                   <div className="flex items-center space-x-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Connected' ? 'bg-primary animate-pulse' : 'bg-orange-500'}`}></div>
                     <span className="text-xs font-medium">{p.status}</span>
                   </div>
                 </td>
                 <td className="px-6 py-4 text-right font-mono text-sm">${p.lift.toLocaleString()}</td>
                 <td className="px-6 py-4 text-right font-mono text-sm text-primary font-bold">
                   ${p.fee.toLocaleString()}
                 </td>
                 <td className="px-6 py-4 text-center">
                   <button className="p-2 text-muted-foreground hover:text-foreground">
                     <MoreHorizontal className="w-4 h-4" />
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalMarginView;
