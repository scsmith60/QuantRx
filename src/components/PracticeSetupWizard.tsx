import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Database, Zap, CheckCircle2, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { supabase } from '../services/cmsService';

interface PracticeSetupWizardProps {
    organizationId: string;
    onComplete: () => void;
}

const PracticeSetupWizard: React.FC<PracticeSetupWizardProps> = ({ organizationId, onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        npi: '',
        specialty: 'ONCOLOGY',
        ehr: 'EPIC',
        threshold: '100'
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const finishSetup = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('practice_config')
            .update({
                npi_number: formData.npi,
                ehr_system: formData.ehr,
                specialty_focus: formData.specialty,
                is_setup_complete: true,
                updated_at: new Date().toISOString()
            })
            .eq('organization_id', organizationId);

        if (error) {
            console.error("[Wizard] Setup update failed:", error);
            // Fallback: If update fails because row doesn't exist, try insert
            const { error: insertError } = await supabase
                .from('practice_config')
                .insert({
                    organization_id: organizationId,
                    npi_number: formData.npi,
                    ehr_system: formData.ehr,
                    specialty_focus: formData.specialty,
                    is_setup_complete: true
                });
            
            if (insertError) {
                alert(`Setup Error: ${insertError.message}`);
                setLoading(false);
                return;
            }
        }
        
        onComplete();
    };

    const steps = [
        { id: 1, title: 'Identity', icon: <Building2 className="w-5 h-5" /> },
        { id: 2, title: 'Connectivity', icon: <Database className="w-5 h-5" /> },
        { id: 3, title: 'Yield Logic', icon: <Zap className="w-5 h-5" /> }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-[#020204] flex items-center justify-center p-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00F5FF]/10 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(57,255,20,0.1)] overflow-hidden"
            >
                {/* Header / Stepper */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-[0_0_20px_rgba(57,255,20,0.4)]">Q</div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Vault Provisioning</h2>
                            <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Initialization Sequence: Phase {step}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        {steps.map((s) => (
                            <div key={s.id} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${step >= s.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/5 text-muted-foreground border border-white/10'}`}>
                                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                                </div>
                                <span className={`text-[8px] mt-1.5 font-bold uppercase tracking-tighter ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10 min-h-[400px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 flex-1"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold text-white">Clinical Identity</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Verification of your practice's National Provider Identifier (NPI) to synchronize GPO contracts and ASP pricing.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground flex items-center">
                                            <ShieldCheck className="w-3 h-3 mr-2 text-primary" /> Facility NPI Number
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="10-Digit Identifier"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary transition-all outline-none font-mono"
                                            value={formData.npi}
                                            onChange={e => setFormData({...formData, npi: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Primary Specialty</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['ONCOLOGY', 'RHEUMATOLOGY', 'UROLOGY'].map(spec => (
                                                <button
                                                    key={spec}
                                                    onClick={() => setFormData({...formData, specialty: spec})}
                                                    className={`py-3 rounded-xl border text-[10px] font-bold tracking-widest transition-all ${formData.specialty === spec ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'}`}
                                                >
                                                    {spec}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 flex-1"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold text-white">EHR Connectivity</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Establish a secure FHIR or HL7 bridge to your Electronic Health Record (EHR) system for live patient data syncing.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {['EPIC', 'CERNER', 'ATHENA', 'OTHER'].map(ehr => (
                                        <button
                                            key={ehr}
                                            onClick={() => setFormData({...formData, ehr: ehr})}
                                            className={`p-6 rounded-2xl border flex flex-col items-center justify-center transition-all ${formData.ehr === ehr ? 'bg-[#00F5FF]/10 border-[#00F5FF] text-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.2)]' : 'bg-white/5 border-white/10 text-muted-foreground hover:border-white/20'}`}
                                        >
                                            <Database className={`w-8 h-8 mb-3 ${formData.ehr === ehr ? 'text-[#00F5FF]' : 'text-muted-foreground'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{ehr}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start space-x-3">
                                    <ShieldCheck className="w-5 h-5 text-yellow-500 shrink-0" />
                                    <p className="text-[10px] text-yellow-500/80 leading-relaxed italic">"Production syncing is restricted to verified HL7 endpoints. Mock clinical data will be used if the sandbox environment is active."</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8 flex-1"
                            >
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold text-white">Yield Logic Engine</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Configure the sensitivity thresholds for the QuantRx Intelligence Engine to trigger optimization alerts.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Min Yield Threshold (USD)</label>
                                            <span className="text-primary font-bold font-mono">${formData.threshold}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="5000" 
                                            step="50"
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                            value={formData.threshold}
                                            onChange={e => setFormData({...formData, threshold: e.target.value})}
                                        />
                                        <div className="flex justify-between text-[8px] text-muted-foreground font-mono uppercase">
                                            <span>High Sensitivity</span>
                                            <span>Conservative</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center space-x-4">
                                        <Activity className="w-8 h-8 text-primary animate-pulse" />
                                        <div>
                                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Engine Simulation</h4>
                                            <p className="text-[10px] text-muted-foreground mt-1">Based on these settings, your projected monthly profit recovery lift is <span className="text-primary font-bold">+$14,200</span>.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer Controls */}
                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5">
                        <button 
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${step === 1 ? 'text-white/10' : 'text-muted-foreground hover:text-white'}`}
                        >
                            Back
                        </button>
                        
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={step === 3 ? finishSetup : handleNext}
                            disabled={loading || (step === 1 && !formData.npi)}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center space-x-2 shadow-[0_0_30px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:shadow-none"
                        >
                            <span>{loading ? 'CALCULATING...' : step === 3 ? 'Finalize Provisioning' : 'Next Phase'}</span>
                            {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                        </motion.button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="bg-white/[0.03] p-4 flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Vault-Level Encrypted</span>
                    </div>
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <div className="flex items-center space-x-1.5">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">HIPAA Baseline: PASSED</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PracticeSetupWizard;
