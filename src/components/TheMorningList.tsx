import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, Zap, ChevronRight } from 'lucide-react';
import { yieldService, type StrategyOption } from '../services/yieldService';
import { motion, AnimatePresence } from 'framer-motion';

interface MorningListPatient {
    id: string;
    name: string;
    orderHcpcs: string;
    orderNdc: string;
    payer: string;
    route: 'IV' | 'Oral' | 'SubQ';
    time: string;
}

const TheMorningList: React.FC = () => {
    const [patients, setPatients] = useState<MorningListPatient[]>([]);
    const [optimizations, setOptimizations] = useState<Record<string, StrategyOption>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // ... (existing useEffect logic)
        const todaySchedule: MorningListPatient[] = [
            { id: 'pat-101', name: 'Patient (Vault-01A)', orderHcpcs: 'J2506', orderNdc: '00069-0322-01', payer: 'Medicare B', route: 'SubQ', time: '08:30 AM' },
            { id: 'pat-102', name: 'Patient (Vault-02B)', orderHcpcs: 'ORAL', orderNdc: '00069-0231-01', payer: 'Aetna PPO', route: 'Oral', time: '09:15 AM' },
            { id: 'pat-103', name: 'Patient (Vault-03C)', orderHcpcs: 'J9035', orderNdc: '00439-0110-01', payer: 'UnitedHealth', route: 'IV', time: '10:00 AM' },
            { id: 'pat-104', name: 'Patient (Vault-04D)', orderHcpcs: 'ORAL', orderNdc: '00069-0231-01', payer: 'Blue Shield', route: 'Oral', time: '11:00 AM' },
        ];

        setPatients(todaySchedule);

        const runAnalysis = async () => {
            const results: Record<string, StrategyOption> = {};
            await Promise.all(todaySchedule.map(async (p) => {
                results[p.id] = await yieldService.calculateOptimalYield(p);
            }));
            setOptimizations(results);
            setIsLoading(false);
        };

        runAnalysis();
    }, []);

    const winnerCount = Object.values(optimizations).filter(o => o.type !== 'NONE').length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center group"
                >
                    <div className={`p-1.5 rounded-lg mr-3 transition-colors ${isCollapsed ? 'bg-white/5' : 'bg-primary/20'}`}>
                        <Clock className={`w-4 h-4 ${isCollapsed ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center group-hover:text-primary transition-colors">
                            The Morning List
                            <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${isCollapsed ? '' : 'rotate-90 text-primary'}`} />
                        </h2>
                    </div>
                </button>
                <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <span className="text-[10px] font-bold text-primary tracking-tight uppercase">
                        {winnerCount} {winnerCount === 1 ? 'Winner' : 'Winners'} Detected
                    </span>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{ height: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
                className="overflow-hidden"
            >
                <div className="grid gap-4 pt-1">
                    <AnimatePresence mode="popLayout">
                        {patients.map((p, idx) => {
                            const opt = optimizations[p.id];
                            const isHighImpact = opt?.potentialSavings > 300;

                            return (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`glass-panel p-4 rounded-xl border border-white/5 group hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden ${isHighImpact ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right w-16">
                                                <p className="text-[10px] font-bold text-muted-foreground">{p.time}</p>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">{p.name}</p>
                                                <div className="flex items-center space-x-2 text-[10px] text-muted-foreground font-mono">
                                                    <span>{p.route}</span>
                                                    <span>•</span>
                                                    <span className="uppercase">{p.payer}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 px-8">
                                            {isLoading ? (
                                                <div className="h-4 w-32 bg-white/5 animate-pulse rounded" />
                                            ) : opt && opt.type !== 'NONE' ? (
                                                <div className="flex items-center space-x-4">
                                                    <Zap className={`w-4 h-4 ${isHighImpact ? 'text-primary animate-pulse' : 'text-primary/60'}`} />
                                                    <div>
                                                        <p className="text-xs font-bold text-primary group-hover:text-white transition-colors">
                                                            {opt.title}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {opt.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-4 opacity-30">
                                                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Already Optimized</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-right flex items-center space-x-6">
                                            {!isLoading && opt && opt.type !== 'NONE' && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-mono font-bold text-primary">
                                                        +${opt.potentialSavings.toLocaleString()}
                                                    </span>
                                                    <span className="text-[8px] uppercase font-bold text-primary/60 tracking-widest">Net Delta</span>
                                                </div>
                                            )}
                                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                            </button>
                                        </div>
                                    </div>
                                    {isHighImpact && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] pointer-events-none -mr-16 -mt-16" />
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default TheMorningList;
