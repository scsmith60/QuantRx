import React, { useState, useEffect } from 'react';
import { fhirService } from '../services/fhirService';
import { attributionEngine } from '../services/attributionEngine';
import { TrendingUp, Users, DollarSign, Bell } from 'lucide-react';
import FoundMoneySidebar from './FoundMoneySidebar.tsx';
import LiveYieldDashboard from './LiveYieldDashboard.tsx';
import SpecialtyTabs from './SpecialtyTabs.tsx';
import RecoveryGauge from './RecoveryGauge.tsx';
import WhiteBagAuditor from './WhiteBagAuditor.tsx';
import SpecialtyRxView from './SpecialtyRxView.tsx';
import { rebateEngine } from '../services/rebateEngine';

const PracticePortal: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [totalFoundMoney, setTotalFoundMoney] = useState(0);
  const [activeSpecialty, setActiveSpecialty] = useState('oncology');
  const [userRole, setUserRole] = useState<'clinician' | 'admin' | 'cfo'>('admin');
  const [activeChannel, setActiveChannel] = useState<'infusion' | 'pharmacy'>('infusion');
  const [isSyncingCMS, setIsSyncingCMS] = useState(false);

  // Mock Contract Terms for global aggregate calc
  const mockContracts: Record<string, any> = {
    '00069-0322-01': { wholesalerPrice: 3245.00, gpoRebatePercent: 2, mfgRebateAmount: 0 },
    '00069-0322-02': { wholesalerPrice: 1150.00, gpoRebatePercent: 5, mfgRebateAmount: 50 },
    '00069-0322-03': { wholesalerPrice: 1210.00, gpoRebatePercent: 4, mfgRebateAmount: 40 },
    '00069-0322-04': { wholesalerPrice: 1850.00, gpoRebatePercent: 3, mfgRebateAmount: 0 },
    '00069-0322-05': { wholesalerPrice: 980.00, gpoRebatePercent: 6, mfgRebateAmount: 120 },
  };

  useEffect(() => {
    // Load mock data
    const loadData = async () => {
      setIsSyncingCMS(true);
      const allPatients = await fhirService.getMockSchedule();
      setTimeout(() => setIsSyncingCMS(false), 2000); // Simulate sync animation
      
      // Filter by specialty
      const filtered = allPatients.filter((p: any) => p.specialty === activeSpecialty);
      setPatients(filtered);
      
      // Calculate initial aggregate lift for active specialty using Triple Latch formula
      const total = filtered.reduce((sum: number, p: any) => {
        const recTerms = mockContracts[p.recNdc] || { wholesalerPrice: 0, gpoRebatePercent: 0, mfgRebateAmount: 0 };
        const netCost = rebateEngine.calculateTrueNetCost(recTerms);
        return sum + rebateEngine.calculateRecoveryProfit(p.remittancePayout, netCost);
      }, 0);
      setTotalFoundMoney(total);

      // Log intent for each recommendation found in the schedule
      filtered.forEach((p: any) => {
        attributionEngine.logIntent(p.id, p.orderHcpcs, p.recHcpcs);
      });
    };
    loadData();
  }, [activeSpecialty]);

  const potentialTotal = totalFoundMoney > 0 ? totalFoundMoney * 1.4 : 10000; // Realistic potential if zero

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden font-sans">
      {/* Sidebar - Navigation */}
      <aside className="w-16 border-r border-border flex flex-col items-center py-6 space-y-8 glass-panel z-10">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl [text-shadow:0_0_15px_rgba(57,255,20,0.5)]">
          Q
        </div>
        <nav className="flex flex-col space-y-6 text-muted-foreground">
          <TrendingUp className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
          <Users className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
          <DollarSign className="w-5 h-5 hover:text-primary cursor-pointer transition-colors" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-border flex items-center justify-between px-8 glass-panel shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-white">QuantRx Hub</h1>
              <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isSyncingCMS ? 'bg-yellow-500 animate-pulse' : 'bg-primary'}`} />
                {isSyncingCMS ? 'Syncing CMS Part B ASP...' : 'Live FHIR Bridge v2.0'}
              </div>
            </div>

            <div className="h-10 w-px bg-white/10" />

            {/* Channel Switcher */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                <button 
                    onClick={() => setActiveChannel('infusion')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeChannel === 'infusion' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
                >
                    Infusion Room
                </button>
                <button 
                    onClick={() => setActiveChannel('pharmacy')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeChannel === 'pharmacy' ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                    Specialty Pharmacy
                </button>
            </div>
            
            <SpecialtyTabs activeTab={activeSpecialty} onTabChange={setActiveSpecialty} userRole={userRole} />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Total Recovered</p>
              <p className="text-xl font-mono font-bold text-primary">
                ${totalFoundMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-primary uppercase tracking-widest font-bold">QuantRx Fee (15%)</p>
              <p className="text-xl font-mono font-bold text-white/40">
                ${(totalFoundMoney * 0.15).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full blur-[1px]"></span>
            </div>
            <div 
                onClick={() => setUserRole(prev => prev === 'admin' ? 'clinician' : 'admin')}
                className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-sm text-white cursor-pointer hover:border-primary transition-all group"
            >
              <span className="group-hover:hidden">{userRole === 'admin' ? 'JD' : 'DR'}</span>
              <span className="hidden group-hover:block text-[8px]">{userRole === 'admin' ? 'ADM' : 'CLIN'}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 flex overflow-hidden bg-black/20">
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
             {activeSpecialty === 'specialtyrx' ? (
                <SpecialtyRxView />
             ) : (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 space-y-8">
                    <LiveYieldDashboard patients={patients} />
                    <WhiteBagAuditor />
                    </div>
                    <div className="xl:col-span-1 space-y-8">
                    <RecoveryGauge recovered={totalFoundMoney} potential={potentialTotal} />
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Market Intelligence</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            CMS ASP Rates for Q3 2026 have been synchronized. Rheum leakage detected in Medicare Payer B network.
                        </p>
                    </div>
                    </div>
                </div>
             )}
          </div>
          
          {/* Found Money Sidebar */}
          <FoundMoneySidebar totalFound={totalFoundMoney} patients={patients} />
        </div>
      </main>
    </div>
  );
};

export default PracticePortal;
