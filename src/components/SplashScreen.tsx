import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_NDC_DATA = [
  "NDC 0003-0103-30 | NEULASTA | 6MG/0.6ML",
  "NDC 64516-0114-1 | UDENYCA | 6MG/0.6ML",
  "NDC 55513-0110-1 | ARMLUPEG | 6MG/0.6ML",
  "NDC 0003-0103-30 | OPTIMIZING...",
  "HCPCS J2506 | REVENUE DETECTED",
  "GAP ANALYSIS: 15% LIFT TARGET",
  "SIG: PRE-AUTH REQUIRED | PASS",
  "NDC 0003-0103-30 | NEULASTA | 6MG/0.6ML",
  "NDC 64516-0114-1 | UDENYCA | 6MG/0.6ML",
  "NDC 55513-0110-1 | ARMLUPEG | 6MG/0.6ML",
];

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 6000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020204] flex items-center justify-center overflow-hidden font-mono">
      {/* 1. Oscilloscope Line (Pulse) */}
      <motion.div 
        className="absolute h-px bg-[#00F5FF] shadow-[0_0_15px_rgba(0,245,255,0.8)] z-50"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '100vw', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.0, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
      />

      {/* 2. Scrolling Data Grid */}
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.25, 0.25, 0] }}
        transition={{ delay: 0.8, duration: 2.0, times: [0, 0.2, 0.8, 1] }}
      >
        <motion.div
          animate={{ y: [-200, 200] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="text-[#00F5FF] text-[8px] space-y-2 text-center"
        >
          {Array(20).fill(MOCK_NDC_DATA).flat().map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </motion.div>
      </motion.div>

      {/* 3. Helix Formation (SVG) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1.2, 1.5] }}
        transition={{ delay: 1.5, duration: 1.5, times: [0, 0.2, 0.8, 1] }}
        className="relative z-20"
      >
        <svg width="200" height="200" viewBox="0 0 100 100" className="text-[#39FF14]">
          <motion.path
            d="M50,10 Q60,30 40,50 Q60,70 50,90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          />
          <motion.path
            d="M50,10 Q40,30 60,50 Q40,70 50,90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, ease: "easeInOut", delay: 0.2 }}
          />
          {/* Genetic Marker Points */}
          {[10, 30, 50, 70, 90].map((y, i) => (
            <motion.circle
              key={i}
              cx={50}
              cy={y}
              r="2"
              fill="currentColor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [0, i % 2 === 0 ? 10 : -10, 0] }}
              transition={{ delay: 1.6, duration: 0.5, repeat: Infinity }}
            />
          ))}
        </svg>
      </motion.div>

      {/* 4. Final Logo Reveal */}
      <div className="flex flex-col items-center z-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 2.5, duration: 0.8, ease: "easeOut" }}
          className="flex items-center text-7xl font-sans tracking-tighter"
        >
          <span className="text-white font-light tracking-widest">QUANT</span>
          <span className="text-[#39FF14] font-black ml-2 [text-shadow:0_0_30px_rgba(57,255,20,0.8)] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)]">RX</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.6 }}
          className="mt-4 flex flex-col items-center"
        >
          <p className="text-[#00F5FF] text-xs tracking-[0.5em] font-light uppercase opacity-80">
            Maximizing Margin Per Dose
          </p>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#00F5FF]/50 to-transparent mt-2" />
        </motion.div>
      </div>

      {/* System Metadata Overlays */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="absolute top-10 left-10 text-[10px] text-[#00F5FF] space-y-1"
      >
        <p>REVENUE_ENGINE_INIT: SUCCESS</p>
        <p>BIOSIMILAR_DB: 2026_ASP_LOADED</p>
        <p>FHIR_HANDSHAKE: ENCRYPTED</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        className="absolute bottom-10 right-10 text-[10px] text-[#39FF14] text-right space-y-1"
      >
        <p>SECURE_VAULT: RLS_ACTIVE</p>
        <p>SYSTEM_HEALTH: ELITE</p>
        <p>UPTIME: 99.999%</p>
      </motion.div>
    </div>
  );
};

/**
 * High-end Elevator Door Exit Component
 */
export const EliteExitWrapper: React.FC<{ children: React.ReactNode, show: boolean }> = ({ children, show }) => {
  return (
    <AnimatePresence mode="wait">
      {show ? (
        <motion.div
          key="splash-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          className="fixed inset-0 z-[100]"
        >
          <SplashScreen onComplete={() => {}} /> 
        </motion.div>
      ) : (
        <motion.div
          key="app-content"
          initial={{ clipPath: 'inset(0 50% 0 50%)' }}
          animate={{ clipPath: 'inset(0 0% 0 0%)' }}
          transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
