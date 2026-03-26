import React from 'react';
import { ArrowUpRight, ShieldCheck, TrendingUp } from 'lucide-react';

interface FoundMoneySidebarProps {
  totalFound: number;
  strategyFees: number;
  patients: any[];
}

const FoundMoneySidebar: React.FC<FoundMoneySidebarProps> = ({ totalFound, strategyFees, patients }) => {
  return (
    <aside className="w-96 border-l border-border glass-panel flex flex-col">
      <div className="p-6 border-b border-border bg-primary/5">
        <h2 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 pointer-events-none">Yield Optimization</h2>
        <div className="flex items-center justify-between">
            <p className="text-2xl font-mono font-bold text-white">${strategyFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">15% FEE</span>
        </div>
      </div>
      <div className="p-6 border-b border-border">
        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Live Attribution</h2>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-mono font-bold text-primary">${totalFound.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">Matched to 835 Remittance</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Intent Log (30D matching)</h3>
          <div className="space-y-4">
            {patients.slice(0, 4).map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-medium text-white/50 lowercase">pat: {p.id?.includes('-') ? p.id.split('-')[1] : p.id?.substring(0, 5) || '???'}</span>
                  <span className="text-xs font-bold text-primary">+{p.lastYield || '$412.50'}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold font-mono">
                  <span className="text-muted-foreground">{p.orderHcpcs}</span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-50" />
                  <span className="text-primary">{p.recHcpcs}</span>
                </div>
                <div className="mt-2 text-[8px] text-muted-foreground uppercase tracking-widest opacity-50">
                    Switch Detected • Awaiting Payout
                </div>
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl group-hover:bg-primary/20 transition-all rounded-full -mr-8 -mt-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-2 relative z-10">
             <ShieldCheck className="w-5 h-5 text-primary shadow-sm shadow-primary/20" />
             <span className="text-xs font-bold uppercase tracking-widest">Platform Fee (15%)</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed relative z-10 opacity-80">
            QuantRx tracks attribution via intent logging. We invoice 15% of the lift upon remittance verification.
          </p>
          <div className="absolute bottom-0 right-0 p-2 opacity-5 text-4xl font-bold">15%</div>
        </div>
      </div>
    </aside>
  );
};

export default FoundMoneySidebar;
