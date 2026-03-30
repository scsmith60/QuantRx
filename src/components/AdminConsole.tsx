import React, { useState } from 'react';
import { LayoutGrid, FileText, Globe, Settings, Search, Database, UserCheck } from 'lucide-react';
import GlobalMarginView from './GlobalMarginView.tsx';
import GeneratedInvoices from './GeneratedInvoices.tsx';
import IngesterView from './IngesterView.tsx';
import SystemConfigView from './SystemConfigView.tsx';
import ApprovalsView from './ApprovalsView.tsx';


const AdminConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState('margin');

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar - Admin Navigation */}
      <aside className="w-64 border-r border-border flex flex-col glass-panel">
        <div className="p-6 flex items-center space-x-3 border-b border-border">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">Q</div>
          <span className="font-bold tracking-tight">Admin Console</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('margin')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'margin' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <Globe className="w-4 h-4" />
            <span>Global Margins</span>
          </button>
          <button 
            onClick={() => setActiveTab('invoices')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoices</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
            <LayoutGrid className="w-4 h-4" />
            <span>Practices</span>
          </button>
          <button 
            onClick={() => setActiveTab('ingestion')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ingestion' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>CMS Data Ingestion</span>
          </button>
        </nav>

        <div className="p-4 border-t border-border mt-auto space-y-2">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'approvals' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Pending Approvals</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]' : 'text-muted-foreground hover:bg-secondary'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 glass-panel shadow-sm">
          <div className="flex items-center bg-secondary/50 border border-border rounded-lg px-3 py-1.5 w-96">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Search practices, NPIs, or patients..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Aggregate Monthly Lift</span>
                <span className="text-sm font-mono font-bold text-primary">$1.42M</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-bold">STAFF</div>
          </div>
        </header>

        {/* Console Content */}
        <div className="flex-1 p-8 overflow-y-auto w-full">
            {activeTab === 'margin' && <GlobalMarginView />}
            {activeTab === 'invoices' && <GeneratedInvoices />}
            {activeTab === 'ingestion' && <IngesterView />}
            {activeTab === 'settings' && <SystemConfigView />}
            {activeTab === 'approvals' && <ApprovalsView />}
        </div>
      </main>
    </div>
  );
};

export default AdminConsole;
