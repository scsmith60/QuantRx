import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Zap, Loader2, Info } from 'lucide-react';
import { cmsService, type CMSPriceRecord } from '../services/cmsService';

interface ASPLookupProps {
    isOpen: boolean;
    onClose: () => void;
}

const ASPLookup: React.FC<ASPLookupProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CMSPriceRecord[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const found = await cmsService.searchJoint(query);
                setResults(found);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-4 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto"
                    >
                        {/* Search Header */}
                        <div className="p-6 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search HCPCS or Drug Name (e.g., J3357, Stelara)..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                />
                                {isSearching ? (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                                ) : (
                                    <button 
                                        onClick={onClose}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {results.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {results.map((record) => (
                                        <motion.div 
                                            key={record.hcpcs}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                                    <span className="text-primary font-mono text-xs font-bold">{record.hcpcs}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white uppercase tracking-tight">{record.description}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">CMS Effective: {record.effectiveDate}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-6 text-right">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground font-medium flex items-center justify-end">
                                                       {record.isBiosimilar ? (
                                                            <>Incentive 108% <Zap className="w-2 h-2 ml-1 text-yellow-500" /></>
                                                       ) : (
                                                            <>Standard 106%</>
                                                       )}
                                                    </span>
                                                    <span className={`text-sm font-mono font-bold ${record.isBiosimilar ? 'text-primary' : 'text-white'}`}>
                                                        ${record.reimbursementRate.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : query ? (
                                <div className="p-20 text-center">
                                    <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground text-sm">No CMS records found for "{query}"</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Try searching by HCPCS code (e.g. J2506)</p>
                                </div>
                            ) : (
                                <div className="p-20 text-center">
                                    <Search className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Quick ASP Lookup</p>
                                    <p className="text-[10px] text-muted-foreground mt-2">Search the Q3 2026 Medicare Part B Pricing Files</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Indicator */}
                        <div className="p-4 bg-primary/5 border-t border-white/5 flex items-center justify-center space-x-2">
                             <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                             <span className="text-[9px] text-primary uppercase font-bold tracking-[0.2em]">QuantRx Real-Time Pricing Engine Active</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ASPLookup;
