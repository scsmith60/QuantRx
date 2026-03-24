import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileCheck, Loader2 } from 'lucide-react';
import { rebateEngine } from '../services/rebateEngine';
import { claimIngestor } from '../services/claimIngestor';

interface LiveYieldDashboardProps {
  patients: any[];
}

const LiveYieldDashboard: React.FC<LiveYieldDashboardProps> = ({ patients }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Mock Contract Terms for Buy/Hidden latches
  const mockContracts: Record<string, any> = {
    '00069-0322-01': { wholesalerPrice: 3245.00, gpoRebatePercent: 2, mfgRebateAmount: 0 },
    '00069-0322-02': { wholesalerPrice: 1150.00, gpoRebatePercent: 5, mfgRebateAmount: 50 },
    '00069-0322-03': { wholesalerPrice: 1210.00, gpoRebatePercent: 4, mfgRebateAmount: 40 },
    '00069-0322-04': { wholesalerPrice: 1850.00, gpoRebatePercent: 3, mfgRebateAmount: 0 },
    '00069-0322-05': { wholesalerPrice: 980.00, gpoRebatePercent: 6, mfgRebateAmount: 120 },
  };

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1 text-white">Profit Pulse Dashboard</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60">Triple Latch Analysis (Bill • Buy • Hidden)</p>
        </div>
        <div className="flex space-x-2">
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
            {patients.map((p) => {
              const recTerms = mockContracts[p.recNdc] || { wholesalerPrice: 0, gpoRebatePercent: 0, mfgRebateAmount: 0 };
              const netCost = rebateEngine.calculateTrueNetCost(recTerms);
              const recovery = rebateEngine.calculateRecoveryProfit(p.remittancePayout, netCost);

              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {p.id.split('-')[1]}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">NDC: {p.orderNdc} → <span className="text-[#39FF14]">{p.recNdc}</span></p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-mono text-white">${p.remittancePayout.toLocaleString()}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{p.payer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                        <span className="text-sm font-mono text-white">${netCost.toLocaleString()}</span>
                        <div className="flex items-center space-x-1 opacity-40">
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest leading-none">GPO: {recTerms.gpoRebatePercent}% • MFG: ${recTerms.mfgRebateAmount}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex flex-col px-3 py-1 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-lg"
                    >
                        <span className="text-sm font-mono font-bold text-[#39FF14]">+${recovery.toLocaleString()}</span>
                        <span className="text-[8px] text-[#39FF14] uppercase font-bold tracking-widest">Platform: ${rebateEngine.calculatePlatformFee(recovery).toFixed(2)}</span>
                    </motion.div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(57, 255, 20, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 border border-[#39FF14] text-[#39FF14] hover:bg-[#39FF14] hover:text-black rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest"
                    >
                      Process Switch
                    </motion.button>
                  </td>
                </tr>
              );
            })}
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
