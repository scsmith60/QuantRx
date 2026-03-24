import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ShieldCheck, Zap, ArrowRightLeft, ShieldAlert, FileText, CheckCircle2, Loader2, X } from 'lucide-react';
import { disputeService } from '../services/disputeService';

interface SpecialtyDrug {
    id: string;
    name: string;
    ndc: string;
    type: 'Infusion' | 'Pharmacy';
    interchangeable: boolean;
    macPrice: number;
    dirFee: number;
    aac: number; // Actual Acquisition Cost
}

const mockSpecialtyDrugs: SpecialtyDrug[] = [
    { id: '1', name: 'Stelara', ndc: '57894007005', type: 'Infusion', interchangeable: false, macPrice: 24500, dirFee: 0, aac: 24000 },
    { id: '2', name: 'Humira', ndc: '00074043705', type: 'Pharmacy', interchangeable: true, macPrice: 6500, dirFee: 450, aac: 6200 },
    { id: '3', name: 'Revlimid', ndc: '59572041028', type: 'Pharmacy', interchangeable: false, macPrice: 18400, dirFee: 1200, aac: 19500 }, // Under-reimbursed
    { id: '4', name: 'Udenyca', ndc: '70114010101', type: 'Infusion', interchangeable: true, macPrice: 3800, dirFee: 0, aac: 3200 },
    { id: '5', name: 'Zaltrap', ndc: '00024584005', type: 'Infusion', interchangeable: false, macPrice: 11500, dirFee: 0, aac: 10800 },
];

const SpecialtyRxView: React.FC = () => {
    const [disputeDrug, setDisputeDrug] = useState<SpecialtyDrug | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [appealResult, setAppealResult] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleDisputeMAC = async (drug: SpecialtyDrug) => {
        setDisputeDrug(drug);
        setAppealResult(null);
        setShowSuccess(false);
    };

    const generateAppeal = async () => {
        if (!disputeDrug) return;
        setIsGenerating(true);
        const result = await disputeService.generateMACAppeal({
            rxNumber: `RX-${Math.floor(Math.random() * 900000) + 100000}`,
            patientName: 'Sarah Connor',
            pbmName: 'OptumRx / CVS Caremark',
            drugName: disputeDrug.name,
            ndcCode: disputeDrug.ndc,
            qty: 1,
            reimbursedAmount: disputeDrug.macPrice,
            actualAcquisitionCost: disputeDrug.aac,
            netLossAmount: disputeDrug.aac - disputeDrug.macPrice,
            wholesalerName: 'McKesson Specialty',
            invoiceDate: '2026-03-15',
            invoiceId: 'MCK-99021-X'
        });
        setAppealResult(result.appealLetter);
        setIsGenerating(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rebate Tier Progress */}
                <div className="glass-panel p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-500/10 rounded-xl">
                                <Target className="w-6 h-6 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Rebate Tier Progress</h3>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Q3 2026</span>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-tighter">Pfizer Biosimilar Bundle</p>
                                    <p className="text-sm font-bold text-white">Growth Tier 3 (Target: 85%)</p>
                                </div>
                                <p className="text-sm font-mono text-yellow-500 font-bold">78.2%</p>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '78.2%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* GPO Compliance */}
                <div className="glass-panel p-8 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">GPO Compliance</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] text-primary uppercase font-bold">Elite Status</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-[100px]">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between text-center">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Protocol Sync</span>
                            <p className="text-2xl font-bold text-white">96.4%</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col justify-between text-center">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Price Protection</span>
                            <p className="text-2xl font-bold text-[#00F5FF]">ACTIVE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specialty Hub Asset Table */}
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">Drug Intelligence & Margin Hub</h3>
                        <p className="text-xs text-muted-foreground mt-1">Net Effective Margin (MAC - DIR) Matrix</p>
                    </div>
                    <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">CAA 2026 Compliant</p>
                    </div>
                </div>
                <table className="w-full text-left font-sans">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Medication</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Channel</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Net Margin (Predicted)</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {mockSpecialtyDrugs.map((drug) => {
                            const margin = drug.macPrice - drug.dirFee - drug.aac;
                            const isLoss = margin < 0;
                            
                            return (
                                <tr key={drug.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div>
                                                <p className="text-sm font-bold text-white">{drug.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-mono">NDC: {drug.ndc}</p>
                                            </div>
                                            {drug.interchangeable && (
                                                <div className="p-1 bg-[#00F5FF]/10 rounded border border-[#00F5FF]/30" title="FDA Interchangeable">
                                                    <ArrowRightLeft className="w-3 h-3 text-[#00F5FF]" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase tracking-widest border ${drug.type === 'Infusion' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-blue-500/5 border-blue-500/20 text-blue-400'}`}>
                                            {drug.type === 'Infusion' ? 'Part B' : 'Part D'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       <div className={`w-2 h-2 rounded-full mx-auto ${isLoss ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-primary animate-pulse'}`} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold font-mono ${isLoss ? 'text-red-500' : 'text-primary'}`}>
                                                {isLoss ? '-' : '+'}${Math.abs(margin).toLocaleString()}
                                            </span>
                                            {drug.type === 'Pharmacy' && (
                                                <span className="text-[9px] text-muted-foreground uppercase">DIR Fee: ${drug.dirFee}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {isLoss ? (
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDisputeMAC(drug)}
                                                className="px-4 py-2 bg-red-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg shadow-red-500/20"
                                            >
                                                Dispute MAC
                                            </motion.button>
                                        ) : (
                                            <button className="px-4 py-2 text-muted-foreground text-[10px] font-bold bg-white/5 rounded-lg uppercase tracking-widest border border-white/10 cursor-not-allowed">
                                                Optimized
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MAC Dispute Modal */}
            <AnimatePresence>
                {disputeDrug && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isGenerating && setDisputeDrug(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`relative w-full ${appealResult ? 'max-w-3xl' : 'max-w-md'} bg-[#0a0a0c] p-8 rounded-3xl border border-red-500/30 shadow-2xl shadow-red-900/40 z-10 transition-all duration-500`}
                        >
                             {showSuccess ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 className="w-12 h-12 text-primary" />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-white mb-2">MAC Appeal Filed</h3>
                                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">CAA 2026 Reference: HTI-1-2026-X</p>
                                </div>
                             ) : (
                                <>
                                    <button onClick={() => setDisputeDrug(null)} disabled={isGenerating} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="p-2 bg-red-500/20 rounded-lg">
                                            <ShieldAlert className="w-6 h-6 text-red-500" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">MAC Pricing Dispute</h3>
                                    </div>

                                    {!appealResult ? (
                                        <>
                                            <div className="space-y-4 mb-8">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                                    <p className="text-sm text-white font-bold mb-1">{disputeDrug.name}</p>
                                                    <div className="flex justify-between text-[11px] mb-1">
                                                        <span className="text-muted-foreground">Actual Acquisition Cost (AAC):</span>
                                                        <span className="text-white font-mono">${disputeDrug.aac.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="text-muted-foreground">PBM Reimbursement (MAC):</span>
                                                        <span className="text-red-500 font-mono">${disputeDrug.macPrice.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed text-center">
                                                    QuantRx analytics has detected a **CAA 2026 violation**. The current MAC rate for NDC {disputeDrug.ndc} is below acquisition cost.
                                                </p>
                                            </div>

                                            <button 
                                                onClick={generateAppeal}
                                                disabled={isGenerating}
                                                className="w-full py-4 bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20 uppercase tracking-widest flex items-center justify-center space-x-2"
                                            >
                                                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating CAA 2026 Letter...</span></> : <span>INITIATE FORMAL APPEAL</span>}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2 text-primary">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="text-[10px] font-mono uppercase tracking-widest">MAC Appeal Template Generated</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-[10px] text-muted-foreground italic">
                                                    <Zap className="w-3 h-3 text-yellow-500" />
                                                    Wholesaler Invoice #MCK-99021-X Attached
                                                </div>
                                            </div>

                                            <div className="bg-black/40 border border-white/10 rounded-xl p-6 h-80 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed text-white/70 whitespace-pre-wrap border-l-2 border-l-primary">
                                                {appealResult}
                                            </div>

                                            <button 
                                                onClick={() => { setShowSuccess(true); setTimeout(() => setDisputeDrug(null), 2000); }}
                                                className="w-full py-4 bg-primary text-black text-xs font-bold rounded-xl shadow-lg shadow-primary/20 uppercase tracking-widest"
                                            >
                                                FILE MAC APPEAL BY SECURE FAX
                                            </button>
                                        </div>
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

export default SpecialtyRxView;
