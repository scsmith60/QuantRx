import React from 'react';
import { motion } from 'framer-motion';

interface RecoveryGaugeProps {
  recovered: number;
  potential: number;
}

const RecoveryGauge: React.FC<RecoveryGaugeProps> = ({ recovered, potential }) => {
  const percentage = potential > 0 ? Math.min((recovered / potential) * 100, 100) : 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = isNaN(percentage) ? circumference : circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl border border-white/10 shadow-emerald-900/10 shadow-xl">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#39FF14"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px rgba(57, 255, 20, 0.4))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white font-mono">{Math.round(percentage)}%</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Recovered</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-1">Total Recovery</p>
        <p className="text-lg font-mono font-bold text-white">
          ${recovered.toLocaleString()} <span className="text-muted-foreground text-xs font-normal">/ ${potential.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
};

export default RecoveryGauge;
