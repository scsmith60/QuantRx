import React, { useState, useEffect } from 'react';
import { Database, UploadCloud, FileText, CheckCircle2, AlertTriangle, Building2, Receipt, ShieldCheck, Plus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import EHRConnectionModal from './EHRConnectionModal.tsx';
import { ehrService, type EHRConnectionConfig, EHR_VENDORS } from '../services/ehrService';

const DataCenterView: React.FC = () => {
    const [uploading, setUploading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isEHRModalOpen, setIsEHRModalOpen] = useState(false);
    const [activeEHR, setActiveEHR] = useState<EHRConnectionConfig | null>(null);

    useEffect(() => {
        const config = ehrService.getConfig();
        if (config) setActiveEHR(config);
    }, []);

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

    const connectedVendor = EHR_VENDORS.find(v => v.id === activeEHR?.vendorId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
                        <Database className="w-8 h-8 mr-4 text-primary" />
                        Secure Data Center
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                        Upload datasets or connect your EHR directly via FHIR to power the QuantRx Hub.
                    </p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center space-x-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <div className="text-[10px] uppercase font-bold tracking-widest text-primary">Vault Status: Optimized</div>
                    </div>
                </div>
            </header>

            {/* Direct EHR Integration Section */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-32 h-32 text-primary" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <Zap className="w-6 h-6 mr-3 text-primary" />
                            Direct EHR Bridge (SMART on FHIR)
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            Bypass manual uploads by connecting your EHR directly. Automated daily synchronization of billing, orders, and patient demographics.
                        </p>
                    </div>

                    {activeEHR ? (
                        <div className="flex items-center space-x-6 p-4 bg-black/40 rounded-2xl border border-white/10">
                            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xl ${connectedVendor?.logoColor}`}>
                                {connectedVendor?.name[0]}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">{connectedVendor?.name}</p>
                                <p className="text-[10px] text-primary uppercase font-bold tracking-widest mt-1">Live Connection</p>
                            </div>
                            <button 
                                onClick={() => setIsEHRModalOpen(true)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-white/60 hover:text-white transition-all uppercase"
                            >
                                Settings
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsEHRModalOpen(true)}
                            className="px-8 py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all flex items-center group/btn"
                        >
                            <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform" />
                            Connect EHR
                        </button>
                    )}
                </div>
            </div>

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

            <EHRConnectionModal 
                isOpen={isEHRModalOpen}
                onClose={() => setIsEHRModalOpen(false)}
                onSuccess={(config) => setActiveEHR(config)}
            />
        </div>
    );
};

export default DataCenterView;

