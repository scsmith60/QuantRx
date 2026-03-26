import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle, Fingerprint, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../services/cmsService';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
  };

  return (
    <div className="flex h-screen w-full bg-[#020204] overflow-hidden font-sans">
      
      {/* LEFT SIDE: THE SIGNAL (60%) */}
      <div className="relative hidden lg:flex h-full w-[60%] flex-col items-center justify-center border-r border-white/5 overflow-hidden">
        {/* Animated Data Waves Background */}
        <div className="absolute inset-0 z-0">
          <svg className="h-full w-full opacity-30" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#00F5FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Simulated Spread Waves */}
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
                    <span className="text-[#00F5FF] font-mono text-xs tracking-[0.4em] uppercase">Live Market Feed</span>
                    <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#00F5FF]" />
                </div>
                <h2 className="text-5xl font-light text-white tracking-tight leading-tight mb-4">
                   Real-time <span className="text-[#00F5FF] font-medium">Profit Recovery & Margin Optimization</span> <br /> 
                   for Specialty Practices.
                </h2>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                   Join 420+ premium practices recovering an average of <span className="text-primary font-bold">$2,400+ in margin per patient</span>.
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
          whileHover={{ rotateY: 5, rotateX: -5, scale: 1.01 }}
          className="relative w-full max-w-md p-[2px] rounded-3xl neon-border-rotate"
        >
          <div className="relative z-10 w-full h-full glass-panel rounded-3xl p-10 flex flex-col">
            
            <div className="flex items-center space-x-2 mb-10">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">Q</div>
                <h1 className="text-2xl font-bold tracking-tight text-white">QuantRX <span className="text-primary">Vault</span></h1>
            </div>

            <form 
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center animate-pulse">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Institutional ID</label>
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
                <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Biometric Passcode</label>
                <div className={`relative transition-all duration-300 rounded-xl bg-white/5 border ${passFocus ? 'border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'border-white/10'}`}>
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${passFocus ? 'text-[#39FF14]' : 'text-muted-foreground'}`} />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      autoComplete="current-password"
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
                <span>{loading ? 'AUTHENTICATING...' : 'BIOMETRIC SIGN-IN'}</span>
              </motion.button>

              <button 
                type="button"
                className="w-full text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-white transition-colors"
              >
                 Manual Credential Access
              </button>
            </form>

            {/* Security Badges */}
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

        {/* Lead Capture Link */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-muted-foreground text-sm"
        >
          New Practice? <span className="text-primary font-medium hover:underline cursor-pointer inline-flex items-center">Request Vault Access <ArrowRight className="ml-1 w-3 h-3" /></span>
        </motion.p>

      </div>
    </div>
  );
};

export default Login;
