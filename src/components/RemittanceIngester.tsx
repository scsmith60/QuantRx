import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, RefreshCw, Database, FileText } from 'lucide-react';
import { claimIngestor } from '../services/claimIngestor';

type UploadState = 'idle' | 'parsing' | 'success' | 'error';

interface FileUploadZoneProps {
  label: string;
  description: string;
  accept: string;
  onFileSelect: (file: File) => void;
  file: File | null;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ label, description, accept, onFileSelect, file }) => (
  <div className="relative overflow-hidden group">
    <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-300 ${file ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
    <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'}`}>
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
          }
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      {file ? (
        <>
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">{file.name}</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Ready for Triple Latch</p>
        </>
      ) : (
        <>
          <UploadCloud className="w-10 h-10 text-muted-foreground/50 mb-3 group-hover:text-primary transition-colors" />
          <h3 className="font-semibold text-foreground mb-1">{label}</h3>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          <div className="mt-3 px-3 py-1 bg-secondary/40 rounded border border-border border-dashed">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block">No prior data cache found</span>
          </div>
        </>
      )}
    </div>
  </div>
);

const RemittanceIngester: React.FC = () => {
    const [remit835File, setRemit835File] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadState>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [stats, setStats] = useState<any | null>(null);

    const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));

    const processRemittance = async () => {
        if (!remit835File) return;

        setStatus('parsing');
        addLog(`Initiating Triple Latch Reconciliation for ${remit835File.name}...`);
        
        try {
            const result = await claimIngestor.process835(remit835File);
            
            if (result.processed) {
                addLog(`SUCCESS: Processed ${result.claimsCount} claims.`);
                addLog(`TRIPLE LATCH: Found ${result.attributionsFound} matches.`);
                setStats(result);
                setStatus('success');
            }
        } catch (err: any) {
            setStatus('error');
            addLog(`REMITTANCE FAILURE: ${err.message}`);
        }
    };

    return (
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-8 shadow-xl shadow-indigo-500/5 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Financial Remittance Advice (EDI 835)</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">
                        Upload Payer Remittance Advice
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Drag and drop your EDI 835 files here to perform the <strong>Triple Latch</strong>. 
                        The engine will cross-reference payer payouts against your Clinical Managed Therapies to lock in revenue and calculate platform fees.
                    </p>
                    
                    {stats && (
                        <div className="grid grid-cols-3 gap-4 pt-4 animate-in fade-in slide-in-from-left-4 duration-500">
                             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                 <p className="text-[9px] uppercase font-bold text-muted-foreground">Claims Found</p>
                                 <p className="text-lg font-mono font-bold text-indigo-400">{stats.claimsCount}</p>
                             </div>
                             <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                 <p className="text-[9px] uppercase font-bold text-muted-foreground">Vault Matches</p>
                                 <p className="text-lg font-mono font-bold text-emerald-400">{stats.attributionsFound}</p>
                             </div>
                             <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                 <p className="text-[9px] uppercase font-bold text-indigo-400">Yield Fee (15%)</p>
                                 <p className="text-lg font-mono font-bold text-indigo-400">${stats.platformFees.toLocaleString()}</p>
                             </div>
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col items-center gap-6 flex-1 lg:max-w-md">
                    <FileUploadZone 
                        label="835 EDI File" 
                        description="Drag .edi remit file here" 
                        accept=".edi,.txt" 
                        file={remit835File} 
                        onFileSelect={setRemit835File} 
                    />
                    <button 
                        onClick={processRemittance}
                        disabled={!remit835File || status === 'parsing'}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/40 transition-all disabled:opacity-50 flex items-center justify-center space-x-3 group"
                    >
                        {status === 'parsing' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                        <span className="uppercase tracking-[0.2em] text-xs font-black">{status === 'parsing' ? 'MATCHING...' : 'RUN RECONCILIATION'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] space-y-1">
                <p className="text-indigo-400 font-bold uppercase tracking-widest mb-2 opacity-60">Engine Logs // Reconciliation</p>
                {logs.map((log, i) => (
                    <div key={i} className="text-white/40">{log}</div>
                ))}
                {logs.length === 0 && <p className="text-white/20 italic">Awaiting transmission...</p>}
            </div>
        </div>
    );
};

export default RemittanceIngester;
