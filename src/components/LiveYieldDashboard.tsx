import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileCheck, Loader2 } from 'lucide-react';
import { claimIngestor } from '../services/claimIngestor';
import { yieldService } from '../services/yieldService';
import YieldRow from './YieldRow';

interface LiveYieldDashboardProps {
  patients: any[];
}

const LiveYieldDashboard: React.FC<LiveYieldDashboardProps> = ({ patients }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOnlyActionable, setShowOnlyActionable] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [yieldMap, setYieldMap] = useState<Record<string, any>>({});

  const handleAuditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await claimIngestor.process835(file);
    setAuditResult(result);
    setIsUploading(false);
  };

  useEffect(() => {
    const precalculateYields = async () => {
      const results: Record<string, any> = {};
      await Promise.all(patients.map(async (p) => {
        results[p.id] = await yieldService.calculatePatientYield(p);
      }));
      setYieldMap(results);
    };
    precalculateYields();
  }, [patients]);

  const actionablePatients = patients.filter(p => {
    if (!showOnlyActionable) return true;
    const patientYield = yieldMap[p.id];
    // strategy.potentialSavings is the correct property from calculatePatientYield output
    return patientYield?.strategy?.potentialSavings > 0;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1 text-white">Profit Pulse Dashboard</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60">Triple Latch Analysis (Bill • Buy • Hidden)</p>
        </div>
        <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Show Only Actionable</span>
                <button 
                    onClick={() => setShowOnlyActionable(!showOnlyActionable)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${showOnlyActionable ? 'bg-primary' : 'bg-white/10'}`}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showOnlyActionable ? 'right-1' : 'left-1'}`} />
                </button>
            </div>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-mono font-bold">REBATES SYNCED</span>
            </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 glass-panel overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Therapeutic Session</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">The Bill (Payer)</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">The Buy (Inv - Reb)</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-[#39FF14]">Net Recovery</th>
              <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {actionablePatients.map((p) => (
                <YieldRow key={p.id} patient={p} />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 835 Audit Section */}
      <div 
        onClick={handleAuditClick}
        className="mt-12 p-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer bg-secondary/10 relative overflow-hidden"
      >
         <input 
           type="file" 
           ref={fileInputRef} 
           className="hidden" 
           onChange={handleFileChange}
           accept=".edi,.txt"
         />
         
         {isUploading ? (
           <Loader2 className="w-16 h-16 text-primary animate-spin" />
         ) : auditResult ? (
           <FileCheck className="w-16 h-16 text-primary" />
         ) : (
           <Upload className="w-16 h-16 text-muted-foreground" />
         )}

         <div>
            <h3 className="text-lg font-bold">{auditResult ? 'Audit Complete' : 'Lost Revenue Audit'}</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {auditResult 
                ? `Processed ${auditResult.claimsCount} claims. Found ${auditResult.attributionsFound} switch(es) attributed to QuantRx.`
                : 'Drag and drop EDI 835 Remittance Advice files here to audit historical pharmacy payments.'}
            </p>
         </div>
      </div>
    </div>
  );
};

export default LiveYieldDashboard;
