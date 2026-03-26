import React, { useState } from 'react';
import { Database, UploadCloud, FileText, CheckCircle2, AlertTriangle, Building2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

const DataCenterView: React.FC = () => {
    const [uploading, setUploading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleUpload = (type: string) => {
        setUploading(type);
        setTimeout(() => {
            setUploading(null);
            setSuccess(type);
            setTimeout(() => setSuccess(null), 3000);
        }, 1500);
    };

    const dropzones = [
        {
            id: 'edi_835',
            title: 'EDI 835 Remittance',
            desc: 'Upload insurance and EHR remittance files to power the Lost Revenue Audit.',
            icon: Receipt,
            color: 'text-primary'
        },
        {
            id: 'distributor_buy',
            title: 'Distributor 832 / Invoice',
            desc: 'Upload McKesson, AmerisourceBergen, or Cardinal purchase history.',
            icon: Building2,
            color: 'text-blue-400'
        },
        {
            id: 'gpo_roster',
            title: 'GPO & Mfg Rebates',
            desc: 'Sync Ion, Unity, or direct manufacturer rebate contracts.',
            icon: FileText,
            color: 'text-purple-400'
        },
        {
            id: 'custom_fee',
            title: 'Custom Payer Fee Schedules',
            desc: 'Upload commercial contracted rates (e.g. Aetna, Cigna WAC pricing).',
            icon: Database,
            color: 'text-yellow-400'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
                    <Database className="w-8 h-8 mr-4 text-primary" />
                    Secure Data Center
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                    Upload your practice\'s financial and inventory datasets here. QuantRx will parse, normalize, and merge these files into your secure Vault to power the Yield Optimization engine.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dropzones.map((zone) => (
                    <div 
                        key={zone.id}
                        className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center space-y-4 group relative overflow-hidden"
                    >
                        {uploading === zone.id && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                                <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Parsing File...</span>
                            </div>
                        )}
                        {success === zone.id && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 bg-[#39FF14]/10 backdrop-blur-md z-10 flex flex-col items-center justify-center"
                            >
                                <CheckCircle2 className="w-12 h-12 text-[#39FF14] mb-2" />
                                <span className="text-[10px] uppercase font-bold text-[#39FF14] tracking-widest">Ingestion Complete</span>
                            </motion.div>
                        )}
                        
                        <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${zone.color}`}>
                            <zone.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white mb-1">{zone.title}</h3>
                            <p className="text-xs text-muted-foreground px-4">{zone.desc}</p>
                        </div>
                        <button 
                            onClick={() => handleUpload(zone.id)}
                            className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white/80 hover:text-white transition-colors flex items-center"
                        >
                            <UploadCloud className="w-4 h-4 mr-2 opacity-50" />
                            Select File
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start space-x-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-yellow-500 mb-1">HIPAA Compliance Notice</h4>
                    <p className="text-xs text-yellow-500/70 leading-relaxed">
                        All EDI 835 and 832 files are scrubbed for PHI locally before transit. Patient identifiers are irreversibly hashed, ensuring your QuantRx Vault remains a zero-knowledge environment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataCenterView;
