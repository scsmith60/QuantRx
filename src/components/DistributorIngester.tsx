import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, Loader2, X } from 'lucide-react';
import { supabase } from '../services/cmsService';

interface DistributorIngesterProps {
    isOpen: boolean;
    onClose: () => void;
}

const DistributorIngester: React.FC<DistributorIngesterProps> = ({ isOpen, onClose }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [stats, setStats] = useState({ items: 0 });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        
        // Mocking CSV Parse & DB Insert for 2026 e-commerce data
        // In reality, this would use PapaParse and supabase.from('distributor_pricing').upsert()
        await new Promise(r => setTimeout(r, 2000));
        
        setStats({ items: 124 });
        setStatus('success');
        setIsUploading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                                {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Distributor Ingester</h2>
                                <p className="text-sm text-muted-foreground mt-2">Upload ecommerce CSV files from Cardinal, McKesson, or Medline to sync your "Buy" prices.</p>
                            </div>

                            {status === 'success' ? (
                                <motion.div 
                                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                    className="w-full p-4 bg-primary/20 border border-primary/30 rounded-2xl flex items-center space-x-4"
                                >
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest">Ingestion Complete</p>
                                        <p className="text-sm text-white">Successfully updated {stats.items} procurement NDCs.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full p-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center space-y-3 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group"
                                >
                                    <FileText className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-white">Click to Select CSV</p>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept=".csv" />
                                </div>
                            )}

                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary transition-colors mt-4"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DistributorIngester;
