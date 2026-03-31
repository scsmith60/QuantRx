import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle, Fingerprint, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../services/cmsService';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState({ practice: '', npi: '', email: '', name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'login') {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        onLogin();
      }
    } else {
      // 1. Pre-registration Check
      const { data: status, error: rpcError } = await supabase.rpc('check_lead_status', { p_email: email });
      
      if (rpcError) {
        setError("Security check failed. Please contact support.");
        setLoading(false);
        return;
      }

      if (status !== 'APPROVED') {
        setError(status === 'PENDING' ? "Your request is still in the queue. Please check back later." : "Registration not authorized. Please request access first.");
        setLoading(false);
        return;
      }

      // 2. Perform actual Sign Up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else {
        // Success: Trigger redirect to setup
        onLogin();
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020204] overflow-hidden font-sans">
      
      {/* LEFT SIDE: THE SIGNAL (60%) */}
      <div className="relative hidden lg:flex h-full w-[60%] flex-col items-center justify-center border-r border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <svg className="h-full w-full opacity-30" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#00F5FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => (
              <motion.path
                key={i}
                initial={{ d: `M 0 ${200 + i * 80} Q 250 ${150 + i * 80}, 500 ${200 + i * 80} T 1000 ${200 + i * 80}` }}
                animate={{
                  d: [
                    `M 0 ${200 + i * 80} Q 250 ${150 + i * 80}, 500 ${200 + i * 80} T 1000 ${200 + i * 80}`,
                    `M 0 ${200 + i * 80} Q 250 ${250 + i * 80}, 500 ${200 + i * 80} T 1000 ${200 + i * 80}`,
                    `M 0 ${200 + i * 80} Q 250 ${150 + i * 80}, 500 ${200 + i * 80} T 1000 ${200 + i * 80}`
                  ]
                }}
                stroke="url(#waveGrad)"
                strokeWidth="2"
                fill="none"
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </svg>
        </div>

        <div className="relative z-10 text-center px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
                <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#00F5FF]" />
                    <span className="text-[#00F5FF] font-mono text-xs tracking-[0.4em] uppercase">Security Portal</span>
                    <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#00F5FF]" />
                </div>
                <h2 className="text-5xl font-light text-white tracking-tight leading-tight mb-4">
                   Accelerating <span className="text-[#00F5FF] font-medium">Pharmacy Margin Recovery</span> <br /> 
                   through Data Intelligence.
                </h2>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                   Authorized access only. All sessions are encrypted and subject to clinical audit logs.
                </p>
            </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: THE PORTAL (40%) */}
      <div className="relative flex h-full w-full lg:w-[40%] flex-col items-center justify-center p-8">
        
        {/* Floating Glass Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          whileHover={{ rotateY: 2, rotateX: -2, scale: 1.01 }}
          className="relative w-full max-w-md p-[2px] rounded-3xl neon-border-rotate"
        >
          <div className="relative z-10 w-full h-full glass-panel rounded-3xl p-10 flex flex-col">
            
            <div className="flex items-center space-x-2 mb-10">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">Q</div>
                <h1 className="text-2xl font-bold tracking-tight text-white">QuantRX <span className="text-primary">{mode === 'login' ? 'Vault' : 'Registration'}</span></h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold text-center animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Institutional Email</label>
                <div className={`relative transition-all duration-300 rounded-xl bg-white/5 border ${emailFocus ? 'border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'border-white/10'}`}>
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${emailFocus ? 'text-[#39FF14]' : 'text-muted-foreground'}`} />
                    <input 
                      type="email" 
                      placeholder="admin@practice.com"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocus(true)}
                      onBlur={() => setEmailFocus(false)}
                      className="w-full bg-transparent border-none focus:ring-0 text-white p-4 pl-12 text-sm placeholder:text-white/20"
                      required
                    />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{mode === 'login' ? 'Biometric Passcode' : 'Create Security Passcode'}</label>
                <div className={`relative transition-all duration-300 rounded-xl bg-white/5 border ${passFocus ? 'border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'border-white/10'}`}>
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${passFocus ? 'text-[#39FF14]' : 'text-muted-foreground'}`} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPassFocus(true)}
                      onBlur={() => setPassFocus(false)}
                      className="w-full bg-transparent border-none focus:ring-0 text-white p-4 pl-12 text-sm placeholder:text-white/20"
                      required
                    />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all group overflow-hidden relative disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out skew-x-12" />
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Fingerprint className="w-5 h-5" />}
                <span>{loading ? 'AUTHENTICATING...' : mode === 'login' ? 'BIOMETRIC SIGN-IN' : 'INITIALIZE VAULT'}</span>
              </motion.button>

              <button 
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="w-full text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-white transition-colors"
              >
                 {mode === 'login' ? 'Claim Your Approved Vault' : 'Return to Secure Sign-In'}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-80 transition-opacity">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-[7px] font-mono uppercase">HIPAA</span>
                </div>
                <div className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-80 transition-opacity">
                    <Lock className="w-4 h-4 text-[#00F5FF]" />
                    <span className="text-[7px] font-mono uppercase">256-BIT AES</span>
                </div>
                <div className="flex flex-col items-center space-y-1 opacity-40 hover:opacity-80 transition-opacity">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-[7px] font-mono uppercase">BAA SIGNED</span>
                </div>
            </div>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-muted-foreground text-sm"
        >
          New Practice? <span onClick={() => setShowRequestModal(true)} className="text-primary font-medium hover:underline cursor-pointer inline-flex items-center">Request Vault Access <ArrowRight className="ml-1 w-3 h-3" /></span>
        </motion.p>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-[#0A0A0C] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            {requestSubmitted ? (
              <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Transmission Received</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your credentials and NPI ({leadForm.npi}) have been submitted to the QuantRx Compliance Vault. 
                    A Super Admin will contact you at <span className="text-white">{leadForm.email}</span> within 24 hours.
                  </p>
                  <button onClick={() => { setShowRequestModal(false); setRequestSubmitted(false); }} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-xs">Acknowledge</button>
              </div>
            ) : (
              <div className="space-y-6">
                  <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Vault Access Request</h3>
                      <button onClick={() => setShowRequestModal(false)} className="text-muted-foreground hover:text-white transition-colors">✕</button>
                  </div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-mono italic">"Verification required for HIPAA Compliance & GPO Logic Access."</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Practice Name</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none transition-all" 
                            placeholder="e.g. Texas Cancer Specialists"
                            value={leadForm.practice}
                            onChange={e => setLeadForm({...leadForm, practice: e.target.value})}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Facility NPI (10-Digit)</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none transition-all" 
                            placeholder="0123456789"
                            maxLength={10}
                            value={leadForm.npi}
                            onChange={e => setLeadForm({...leadForm, npi: e.target.value})}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Professional Email</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none transition-all" 
                            placeholder="dr.smith@practice.com"
                            value={leadForm.email}
                            onChange={e => setLeadForm({...leadForm, email: e.target.value})}
                          />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Your Full Name</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none transition-all" 
                            placeholder="Dr. John Smith"
                            value={leadForm.name}
                            onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                          />
                      </div>
                  </div>

                  <button 
                    disabled={loading}
                    onClick={async () => {
                      if (!leadForm.practice || !leadForm.npi || !leadForm.email) return;
                      setLoading(true);
                      const { error } = await supabase.from('onboarding_leads').insert({
                          practice_name: leadForm.practice,
                          npi_number: leadForm.npi,
                          admin_email: leadForm.email,
                          full_name: leadForm.name
                      });
                      if (!error) setRequestSubmitted(true);
                      setLoading(false);
                    }}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-xs shadow-[0_0_20px_rgba(57,255,20,0.2)] disabled:opacity-50"
                  >
                    {loading ? 'Transmitting...' : 'Request Credentials'}
                  </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
