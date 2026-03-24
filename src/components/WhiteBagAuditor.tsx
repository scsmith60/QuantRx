import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ShieldAlert, X, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { disputeService } from '../services/disputeService';

interface WhiteBagPatient {
  id: string;
  name: string;
  payer: string;
  lostProfit: number;
  reason: string;
}

const initialMockWhiteBagged: WhiteBagPatient[] = [
  { id: 'wb-001', name: 'Alice Cooper', payer: 'UnitedHealth', lostProfit: 2450.00, reason: 'Mandatory White Bagging' },
  { id: 'wb-002', name: 'David Bowie', payer: 'Cigna', lostProfit: 1820.00, reason: 'Payer-Direct Pharmacy' },
];

const WhiteBagAuditor: React.FC = () => {
  const [patients, setPatients] = React.useState<WhiteBagPatient[]>(initialMockWhiteBagged);
  const [disputePatient, setDisputePatient] = React.useState<WhiteBagPatient | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [appealResult, setAppealResult] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleStartDispute = (p: WhiteBagPatient) => {
    setDisputePatient(p);
    setAppealResult(null);
    setShowSuccess(false);
  };

  const handleFileDispute = async () => {
    if (!disputePatient) return;
    setIsGenerating(true);
    
    try {
        const result = await disputeService.generateAppeal(disputePatient.id, disputePatient.name);
        setAppealResult(result.appealLetter);
        
        // Update local state to show 'Pending' if we had a status column
        // For now just show success UI
        setIsGenerating(false);
    } catch (e) {
        setIsGenerating(false);
    }
  };

  const finalizeDispute = () => {
    if (disputePatient) {
        setPatients(prev => prev.map(p => 
            p.id === disputePatient.id ? { ...p, reason: 'DISPUTE PENDING' } : p
        ));
    }
    setShowSuccess(true);
    setTimeout(() => {
        setDisputePatient(null);
        setShowSuccess(false);
    }, 2000);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">White Bag Recovery Auditor</h3>
            <p className="text-xs text-muted-foreground">Detection of patients forced into payer-direct specialty pharmacy channels.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase opacity-70">Total At-Risk Profit</p>
          <p className="text-xl font-mono font-bold text-amber-500">$4,270.00</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-white/10">
              <th className="px-6 py-4 font-semibold">Patient</th>
              <th className="px-6 py-4 font-semibold">Primary Payer</th>
              <th className="px-6 py-4 font-semibold">Leakage (Estimated)</th>
              <th className="px-6 py-4 font-semibold">Barrier Type</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-white">{p.name}</span>
                  <p className="text-[10px] text-muted-foreground">ID: {p.id}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-secondary/50 px-2 py-1 rounded border border-border text-muted-foreground">{p.payer}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-amber-500">+${p.lostProfit.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-muted-foreground">{p.reason}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartDispute(p)}
                    className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black text-[10px] font-bold px-3 py-1.5 rounded border border-amber-500/30 transition-all flex items-center ml-auto uppercase tracking-widest"
                  >
                    DISPUTE LEAKAGE <ArrowUpRight className="ml-1 w-3 h-3" />
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {disputePatient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGenerating && setDisputePatient(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full ${appealResult ? 'max-w-2xl' : 'max-w-md'} bg-[#0a0a0c] p-8 rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-900/40 z-10 transition-all duration-500`}
            >
               {showSuccess ? (
                 <div className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6"
                    >
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2">Dispute Filed</h3>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Status: DISPUTE PENDING</p>
                 </div>
               ) : (
                <>
                  <button 
                    onClick={() => setDisputePatient(null)}
                    disabled={isGenerating}
                    className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors disabled:opacity-0"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <ShieldAlert className="w-6 h-6 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Initiate Recovery Dispute</h3>
                  </div>

                  {!appealResult ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                          Generate a formal demand for **{disputePatient.name}** citing ERISA anti-steering violations. This will trigger a legal review.
                      </p>

                      <div className="space-y-4 mb-8">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] leading-relaxed">
                              <p className="font-bold mb-1 uppercase tracking-widest text-[#39FF14]">Legal Precedent Applied</p>
                              "Payer-preferred pharmacies must not coerce patients away from their primary care specialty clinic without a valid clinical reason."
                          </div>
                      </div>

                      <button 
                        onClick={handleFileDispute}
                        disabled={isGenerating}
                        className="w-full py-4 bg-amber-500 text-black text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 uppercase tracking-widest flex items-center justify-center space-x-2"
                      >
                          {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating AI Clinical Appeal...</span>
                            </>
                          ) : (
                            <span>GENERATE FORMAL DISPUTE</span>
                          )}
                      </button>
                    </>
                  ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-primary">
                                <FileText className="w-4 h-4" />
                                <span className="text-[10px] font-mono uppercase tracking-widest">Draft Appeal Letter Generated</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">Target: 835 Remittance Adjustment</span>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-xl p-6 h-64 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed text-white/70 whitespace-pre-wrap">
                            {appealResult}
                        </div>

                        <div className="flex space-x-4">
                             <button 
                                onClick={() => setAppealResult(null)}
                                className="flex-1 py-3 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
                            >
                                START OVER
                            </button>
                            <button 
                                onClick={finalizeDispute}
                                className="flex-1 py-4 bg-primary text-black text-xs font-bold rounded-xl shadow-lg shadow-primary/20 uppercase tracking-widest"
                            >
                                FILE FORMAL DISPUTE
                            </button>
                        </div>
                    </motion.div>
                  )}
                </>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhiteBagAuditor;
