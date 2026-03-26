import { motion } from 'framer-motion';
import { TrendingUp, ArrowRightLeft, Zap, ShieldCheck } from 'lucide-react';
import type { StrategyOption } from '../services/yieldService';

interface StrategyCardProps {
    strategy: StrategyOption;
    onExecute: (savings: number, actualQuantity?: number) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onExecute }) => {
    if (strategy.type === 'NONE') return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative p-4 rounded-xl border border-primary/20 bg-black/40 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${strategy.type === 'SWITCH' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-primary/20 text-primary'}`}>
                            {strategy.type === 'SWITCH' ? <ArrowRightLeft size={16} /> : <TrendingUp size={16} />}
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-white uppercase italic">{strategy.title}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Projected Savings</span>
                        <span className="text-sm font-black text-primary font-mono tracking-tighter">${strategy.potentialSavings.toLocaleString()}</span>
                    </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {strategy.description}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-medium">QuantRx Fee (15%)</span>
                        <span className="text-[10px] text-white font-mono font-bold">${strategy.strategyFee.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={() => {
                            if (strategy.type === 'BUY_IN') {
                                const actual = window.prompt(`Plan recommends ${strategy.data.vials} vials. How many did you actually purchase?`, strategy.data.vials.toString());
                                if (actual) {
                                    const qty = parseInt(actual);
                                    const actualSavings = qty * strategy.data.rate;
                                    onExecute(actualSavings, qty);
                                }
                            } else {
                                onExecute(strategy.potentialSavings);
                            }
                        }}
                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all flex items-center group/btn"
                    >
                        {strategy.actionLabel}
                        <ShieldCheck className="w-3 h-3 ml-1.5 group-hover/btn:rotate-12 transition-transform" />
                    </button>
                </div>

                {/* Ambient glow for Biosimilars */}
                {strategy.type === 'SWITCH' && (
                    <div className="absolute -top-1 -right-1">
                        <Zap className="w-4 h-4 text-yellow-500 animate-pulse drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StrategyCard;
