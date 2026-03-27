import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { yieldService } from '../services/yieldService';
import { rebateEngine } from '../services/rebateEngine';

interface YieldRowProps {
    patient: any;
}

const YieldRow: React.FC<YieldRowProps> = ({ patient: p }) => {
    const [strategy, setStrategy] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [netCost, setNetCost] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        const fetchYieldData = async () => {
            setIsLoading(true);
            const { strategy, netCost } = await yieldService.calculatePatientYield(p);
            setStrategy(strategy);
            setNetCost(netCost);
            setIsLoading(false);
        };
        fetchYieldData();
    }, [p.orderHcpcs, p.orderNdc, p.remittancePayout]);

    const recovery = strategy?.potentialSavings || 0;

    const handleReveal = () => {
        setIsRevealed(true);
        // In reality, this would trigger a local lookup via SMART on FHIR or a decrypter
    };

    const handleExecute = async () => {
        if (!strategy || strategy.type === 'NONE') return;
        
        if (strategy.type === 'SWITCH') {
            await yieldService.logSwitchEvent(p.id, p.orderHcpcs, strategy.data.ndc, recovery);
            alert(`Yield Execution Success: ${strategy.data.description} optimized. Platform Fee: $${rebateEngine.calculatePlatformFee(recovery).toFixed(2)} tracked.`);
        } else if (strategy.type === 'BUY_IN') {
            const actual = window.prompt(`Plan recommends ${strategy.data.vials} vials. How many did you actually purchase?`, strategy.data.vials.toString());
            if (actual) {
                const qty = parseInt(actual);
                const actualSavings = qty * strategy.data.rate;
                await yieldService.logBuyInEvent(p.orderHcpcs, qty, actualSavings);
                alert(`Buy-In Order Placed: $${actualSavings.toLocaleString()} in price protection locked. Platform Fee: $${rebateEngine.calculatePlatformFee(actualSavings).toFixed(2)} attributed.`);
            }
        }
    };

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-5">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {p.id.split('-')[1]}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <p className={`text-sm font-semibold ${isRevealed ? 'text-white' : 'text-primary/40 font-mono text-[10px]'}`}>
                                {isRevealed ? (p.originalName || "Authorized View") : p.name}
                            </p>
                            {!isRevealed && p.isDeidentified && (
                                <button 
                                    onClick={handleReveal}
                                    className="text-[8px] font-bold text-primary border border-primary/30 px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors uppercase tracking-widest"
                                >
                                    Reveal
                                </button>
                            )}
                        </div>
                        <div className="flex items-center text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                            <span>NDC: {p.orderNdc}</span>
                            {strategy?.type === 'SWITCH' && strategy?.data?.ndc && (
                                <>
                                    <span className="mx-1">→</span>
                                    <span className="text-[#39FF14] flex items-center">
                                        <Zap className="w-2.5 h-2.5 mr-0.5 fill-[#39FF14]" />
                                        {strategy.data.ndc}
                                    </span>
                                </>
                            )}
                        </div>
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
                {isLoading ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                    <div className="flex flex-col">
                        <span className="text-sm font-mono text-white">
                            {netCost > 0 ? `$${netCost.toLocaleString()}` : '$0'}
                        </span>
                        <div className="flex items-center space-x-1 opacity-40">
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest leading-none">
                                {netCost > 0 ? (strategy?.type === 'SWITCH' ? strategy.data.description : 'Current Contract') : 'No Contract Found'}
                            </span>
                        </div>
                    </div>
                )}
            </td>
            <td className="px-6 py-5">
                {isLoading ? (
                    <div className="w-16 h-8 bg-white/5 animate-pulse rounded-lg" />
                ) : (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`inline-flex flex-col px-3 py-1 ${recovery > 0 ? 'bg-[#39FF14]/10 border border-[#39FF14]/20' : 'bg-white/5 border border-white/10'} rounded-lg`}
                    >
                        <span className={`text-sm font-mono font-bold ${recovery > 0 ? 'text-[#39FF14]' : 'text-muted-foreground'}`}>
                            +${recovery.toLocaleString()}
                        </span>
                        <span className={`text-[8px] uppercase font-bold tracking-widest ${recovery > 0 ? 'text-[#39FF14]' : 'text-muted-foreground'}`}>
                            {strategy?.type === 'BUY_IN' ? 'Price Protection' : `Fee: $${rebateEngine.calculatePlatformFee(recovery).toFixed(2)}`}
                        </span>
                    </motion.div>
                )}
            </td>
            <td className="px-6 py-5 text-right">
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: recovery > 0 ? "0 0 15px rgba(57, 255, 20, 0.4)" : "none" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading || (!strategy || strategy.type === 'NONE')}
                    onClick={handleExecute}
                    className={`px-4 py-2 border ${recovery > 0 ? 'border-[#39FF14] text-[#39FF14]' : 'border-white/10 text-white/20'} rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    {strategy && strategy.type !== 'NONE' ? strategy.actionLabel : 'Already Optimized'}
                </motion.button>
            </td>
        </tr>
    );
};

export default YieldRow;
