import React from 'react';
import { motion } from 'framer-motion';

interface SpecialtyTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole?: 'clinician' | 'admin' | 'cfo';
}

const specialties = [
  { id: 'oncology', label: 'Oncology', color: '#39FF14' },
  { id: 'rheum', label: 'Rheumatology', color: '#00F5FF' },
  { id: 'gi', label: 'Gastroenterology', color: '#F0ABFC' },
  { id: 'specialtyrx', label: 'Specialty RX', color: '#FFD700' },
];

const SpecialtyTabs: React.FC<SpecialtyTabsProps> = ({ activeTab, onTabChange, userRole = 'admin' }) => {
  if (userRole === 'clinician') return null;

  return (
    <div className="flex space-x-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
      {specialties.map((spec) => (
        <button
          key={spec.id}
          onClick={() => onTabChange(spec.id)}
          className={`relative px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors duration-300 ${activeTab === spec.id ? 'text-white' : 'text-muted-foreground hover:text-white/70'}`}
        >
          {activeTab === spec.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white/10 rounded-lg border border-white/20"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: spec.color }} />
            {spec.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SpecialtyTabs;
