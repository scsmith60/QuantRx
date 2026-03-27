import React, { useState, useEffect } from 'react';
import { X, Shield, Globe, Key, AlertCircle, CheckCircle2, ChevronRight, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EHR_VENDORS, ehrService, type EHRVendor, type EHRConnectionConfig } from '../services/ehrService';

interface EHRConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (config: EHRConnectionConfig) => void;
}

const EHRConnectionModal: React.FC<EHRConnectionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedVendor, setSelectedVendor] = useState<EHRVendor | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [fhirUrl, setFhirUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedVendor(null);
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSelectVendor = (vendor: EHRVendor) => {
    setSelectedVendor(vendor);
    setFhirUrl(vendor.fhirBaseUrl);
    setStep('configure');
  };

  const handleTestConnection = async () => {
    if (!selectedVendor) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    const config: EHRConnectionConfig = {
      vendorId: selectedVendor.id,
      clientId,
      clientSecret,
      fhirBaseUrl: fhirUrl,
      status: 'connecting'
    };

    const result = await ehrService.testConnection(config);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleConnect = async () => {
    if (!selectedVendor || !testResult?.success) return;

    const config: EHRConnectionConfig = {
      vendorId: selectedVendor.id,
      clientId,
      clientSecret,
      fhirBaseUrl: fhirUrl,
      status: 'connected'
    };

    await ehrService.saveConfig(config);
    onSuccess(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
              <Shield className="w-6 h-6 mr-3 text-primary" />
              EHR Bridge Configuration
            </h2>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-mono">QuantRx Direct Data Pipeline</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'select' ? (
              <motion.div 
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EHR_VENDORS.map((vendor) => (
                    <button
                      key={vendor.id}
                      onClick={() => handleSelectVendor(vendor)}
                      className="group p-6 glass-panel border border-white/5 hover:border-primary/50 transition-all rounded-2xl text-left flex flex-col items-start space-y-3 relative overflow-hidden"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xl ${vendor.logoColor}`}>
                        {vendor.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{vendor.name}</h3>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{vendor.sandboxInfo}</p>
                      </div>
                      <ChevronRight className="absolute right-6 bottom-6 w-5 h-5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="configure"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button 
                  onClick={() => setStep('select')}
                  className="text-xs font-bold text-primary hover:underline flex items-center mb-4"
                >
                  ← Back to Selection
                </button>

                <div className="flex items-center space-x-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xl ${selectedVendor?.logoColor}`}>
                    {selectedVendor?.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedVendor?.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono">{fhirUrl}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center">
                      <Key className="w-3 h-3 mr-2 text-primary" /> Client ID (SMART App)
                    </label>
                    <input 
                      type="text" 
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder={selectedVendor?.clientIdPlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center">
                      <Shield className="w-3 h-3 mr-2 text-primary" /> Client Secret (Optional)
                    </label>
                    <input 
                      type="password" 
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="Leave blank for public sandboxes"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center">
                      <Globe className="w-3 h-3 mr-2 text-primary" /> FHIR Base URL (Override)
                    </label>
                    <input 
                      type="text" 
                      value={fhirUrl}
                      onChange={(e) => setFhirUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {testResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border flex items-start space-x-3 ${testResult.success ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
                  >
                    {testResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                    <div className="text-[11px] leading-relaxed">
                      <p className="font-bold uppercase tracking-widest mb-1">{testResult.success ? 'Success' : 'Handshake Failed'}</p>
                      <p className="opacity-80">{testResult.message}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting || !clientId}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isTesting ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    ) : <Server className="w-4 h-4 mr-2 opacity-50" />}
                    Test Connection
                  </button>

                  <button
                    onClick={handleConnect}
                    disabled={!testResult?.success}
                    className="flex-[1.5] py-4 bg-primary text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] active:scale-[0.98]"
                  >
                    Finalize Connection
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-6 bg-black/40 border-t border-white/5 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed">
                <Shield className="w-3 h-3 inline mr-1 mb-0.5" /> 
                Zero-Knowledge Environment &bull; AES-256 Encryption at Rest &bull; HIPAA Compliant Pipeline
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EHRConnectionModal;
