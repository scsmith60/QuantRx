import React, { useState, useEffect } from 'react';
import { fhirService } from '../services/fhirService';
import { TrendingUp, Users, DollarSign, Bell, Search, Database } from 'lucide-react';
import FoundMoneySidebar from './FoundMoneySidebar.tsx';
import LiveYieldDashboard from './LiveYieldDashboard.tsx';
import SpecialtyTabs from './SpecialtyTabs.tsx';
import RecoveryGauge from './RecoveryGauge.tsx';
import WhiteBagAuditor from './WhiteBagAuditor.tsx';
import SpecialtyRxView from './SpecialtyRxView.tsx';
import ASPLookup from './ASPLookup.tsx';
import DistributorIngester from './DistributorIngester.tsx';
import DataCenterView from './DataCenterView.tsx';
import { yieldService } from '../services/yieldService';
import type { StrategyOption } from '../services/yieldService';
import StrategyCard from './StrategyCard.tsx';
import { cmsService } from '../services/cmsService';
import NotificationsPopover from './NotificationsPopover.tsx';
import type { Notification } from './NotificationsPopover.tsx';


const PracticePortal: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [totalFoundMoney] = useState(11328.00); 
  const [activeSpecialty, setActiveSpecialty] = useState('oncology');
  const [userRole] = useState<'clinician' | 'admin' | 'cfo'>('admin');
  const [isSyncingCMS, setIsSyncingCMS] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isASPLookupOpen, setIsASPLookupOpen] = useState(false);
  const [isIngesterOpen, setIsIngesterOpen] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState<StrategyOption>({ type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' });
  const [totalStrategyFees, setTotalStrategyFees] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'patients' | 'billing' | 'datacenter'>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
        id: '1',
        type: 'system',
        title: 'ASP Pricing Synchronized',
        message: 'CMS Q3 2026 Average Sales Price data successfully merged.',
        timestamp: '2M AGO',
        isRead: false
    },
    {
        id: '2',
        type: 'clinical',
        title: 'New Optimization Detected',
        message: 'Jane Smith (Pat-002) is eligible for a +$2,057 switch.',
        timestamp: '15M AGO',
        isRead: false
    },
    {
        id: '3',
        type: 'financial',
        title: 'GPO Rebate Update',
        message: 'BioSim distribution rebates increased to 2% flat.',
        timestamp: '1H AGO',
        isRead: true
    }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsSyncingCMS(true);
        const [allPatients] = await Promise.all([
            fhirService.getMockSchedule(),
            cmsService.fetchASPData()
        ]);
        
        setIsSyncingCMS(false);
        setLastSyncTime(new Date().toLocaleTimeString());
        
        const filtered = (allPatients || []).filter((p: any) => p && p.specialty === activeSpecialty);
        setPatients(filtered);
        
        const strategy = await yieldService.getOptimizationStrategy('J9035', filtered);
        setActiveStrategy(strategy || { type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' });
        setTotalStrategyFees(yieldService.getTotalStrategyFees());
      } catch (err) {
        console.error("[PracticePortal] Fatal load failure:", err);
        setIsSyncingCMS(false);
      }
    };
    loadData();
  }, [activeSpecialty]);

  const quantrxFee = totalFoundMoney * 0.15 + totalStrategyFees;
  const practiceNet = totalFoundMoney - quantrxFee;
  const potentialTotal = totalFoundMoney > 0 ? totalFoundMoney * 1.4 : 15000;

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden font-sans">
      <aside className="w-16 border-r border-border flex flex-col items-center py-6 space-y-8 glass-panel z-10">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl [text-shadow:0_0_15px_rgba(57,255,20,0.5)]">
          Q
        </div>
        <nav className="flex flex-col space-y-6 text-muted-foreground">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`p-2 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'text-muted-foreground hover:bg-white/5 hover:text-primary'}`}
          >
            <TrendingUp className="w-5 h-5 pointer-events-none" />
          </button>
          <button
            onClick={() => setCurrentView('patients')}
            className={`p-2 rounded-xl transition-all ${currentView === 'patients' ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'text-muted-foreground hover:bg-white/5 hover:text-primary'}`}
          >
            <Users className="w-5 h-5 pointer-events-none" />
          </button>
          <button
            onClick={() => setCurrentView('billing')}
            className={`p-2 rounded-xl transition-all ${currentView === 'billing' ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'text-muted-foreground hover:bg-white/5 hover:text-primary'}`}
          >
            <DollarSign className="w-5 h-5 pointer-events-none" />
          </button>
          <div className="w-8 h-px bg-white/10 mx-auto my-2" />
          <button
            onClick={() => setCurrentView('datacenter')}
            className={`p-2 rounded-xl transition-all ${currentView === 'datacenter' ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'text-muted-foreground hover:bg-white/5 hover:text-primary'}`}
          >
            <Database className="w-5 h-5 pointer-events-none" />
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-border flex items-center justify-between px-8 glass-panel shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-white">QuantRx Hub</h1>
              <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isSyncingCMS ? 'bg-yellow-500 animate-pulse' : 'bg-primary'}`} />
                {isSyncingCMS ? 'Syncing CMS Part B ASP...' : `CMS ASP Live: ${lastSyncTime}`}
                {!isSyncingCMS && (
                  <div className="flex items-center">
                    <button 
                      onClick={() => setIsASPLookupOpen(true)}
                      className="ml-4 px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-[9px] text-primary hover:bg-primary/20 transition-all flex items-center space-x-1"
                    >
                      <Search className="w-2.5 h-2.5" />
                      <span className="font-bold">LOOKUP</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="h-10 w-px bg-white/10" />
            <SpecialtyTabs activeTab={activeSpecialty} onTabChange={setActiveSpecialty} userRole={userRole} />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Gross Recovery</p>
              <p className="text-xl font-mono font-bold text-white">
                ${totalFoundMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#FF3131] uppercase tracking-widest font-bold">QuantRx Fees (15%)</p>
              <p className="text-lg font-mono font-bold text-[#FF3131]/60 tracking-tighter">
                -${quantrxFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Practice Net Profit</p>
              <p className="text-2xl font-mono font-bold text-primary [text-shadow:0_0_20px_rgba(57,255,20,0.3)]">
                ${practiceNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="relative ml-4">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 hover:bg-white/5 rounded-full transition-all group"
              >
                <Bell className={`w-6 h-6 transition-colors ${notifications.some(n => !n.isRead) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full blur-[1px]"></span>
                )}
              </button>

              <NotificationsPopover 
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                notifications={notifications}
                onMarkAsRead={(id: string) => {

                    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
                }}
                onClearAll={() => setNotifications([])}
              />
            </div>

          </div>
        </header>

        <div className="flex-1 flex overflow-hidden bg-black/20">
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
             {currentView === 'dashboard' ? (
                activeSpecialty === 'specialtyrx' ? (
                    <SpecialtyRxView />
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        <div className="xl:col-span-3 space-y-8">
                        <StrategyCard 
                            strategy={activeStrategy} 
                            onExecute={async (savings: number, qty?: number) => {
                                if (activeStrategy.type === 'BUY_IN' && qty) {
                                    await yieldService.logBuyInEvent('J9035', qty, savings);
                                } else {
                                    yieldService.recordExecution(savings);
                                }
                                setTotalStrategyFees(yieldService.getTotalStrategyFees());
                                setActiveStrategy({ type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' });
                            }} 
                        />
                        <LiveYieldDashboard patients={patients} />
                        <WhiteBagAuditor />
                        </div>
                        <div className="xl:col-span-1 space-y-8">
                        <RecoveryGauge recovered={totalFoundMoney} potential={potentialTotal} />
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                            <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Market Intelligence</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                CMS ASP Rates for Q3 2026 have been synchronized. Distributor rebates for Biosimilar NDC classes updated to 2% flat.
                            </p>
                        </div>
                        </div>
                    </div>
                )
             ) : currentView === 'datacenter' ? (
                <DataCenterView />
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p className="font-mono uppercase tracking-tight">View: {currentView.toUpperCase()} (Coming Soon)</p>
                </div>
             )}
          </div>
          <FoundMoneySidebar 
            totalFound={totalFoundMoney} 
            strategyFees={totalStrategyFees}
            patients={patients} 
          />
        </div>
      </main>

      <ASPLookup 
        isOpen={isASPLookupOpen} 
        onClose={() => setIsASPLookupOpen(false)} 
      />
      <DistributorIngester 
        isOpen={isIngesterOpen} 
        onClose={() => setIsIngesterOpen(false)} 
      />
    </div>
  );
};

export default PracticePortal;
