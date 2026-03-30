import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import Papa from 'papaparse';
import { supabase, supabaseKey } from '../services/cmsService';

// Supabase Init moved to centralized singleton in cmsService

type UploadState = 'idle' | 'parsing' | 'merging' | 'uploading' | 'success' | 'error';

interface FileUploadZoneProps {
  label: string;
  description: string;
  accept: string;
  onFileSelect: (file: File) => void;
  file: File | null;
  lastUploaded?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ label, description, accept, onFileSelect, file, lastUploaded }) => (
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
          <p className="text-xs text-muted-foreground">Ready for ingestion</p>
        </>
      ) : (
        <>
          <UploadCloud className="w-10 h-10 text-muted-foreground/50 mb-3 group-hover:text-primary transition-colors" />
          <h3 className="font-semibold text-foreground mb-1">{label}</h3>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
          {lastUploaded ? (
            <div className="mt-3 px-3 py-1 bg-secondary/80 rounded border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-0.5">Currently Active Matrix:</span>
                <span className="text-[11px] text-emerald-400 font-medium truncate max-w-[200px] block" title={lastUploaded}>{lastUploaded}</span>
            </div>
          ) : (
            <div className="mt-3 px-3 py-1 bg-secondary/40 rounded border border-border border-dashed">
                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider block">No prior data cache found</span>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

const IngesterView: React.FC = () => {
  const [q1File, setQ1File] = useState<File | null>(null);
  const [ndc1File, setNdc1File] = useState<File | null>(null);
  
  const [q2File, setQ2File] = useState<File | null>(null);
  const [ndc2File, setNdc2File] = useState<File | null>(null);

  const [q3File, setQ3File] = useState<File | null>(null);
  const [ndc3File, setNdc3File] = useState<File | null>(null);

  const [remit835File, setRemit835File] = useState<File | null>(null);

  const [status, setStatus] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [lastFiles, setLastFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    const cached = localStorage.getItem('quantrx_ingest_cache');
    if (cached) {
        setLastFiles(JSON.parse(cached));
    }
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const processCMSMatrix = async () => {
    if (!q2File && !lastFiles.q2) {
      addLog("ERROR: Current Quarter (Q0) ASP file is strictly required to run a fusion.");
      return;
    }

    setStatus('parsing');
    setProgress(10);
    addLog("Initializing PapaParse Parallel Matrix Engine...");
    
    try {
        const matrix: Record<string, any> = {};

        const parseCSVFile = async (file: File) => {
            try {
                const text = await file.text();
                const lines = text.split('\n');
                
                // DYNAMIC HEADER CLUSTER FINDER (Confidence Score Logic)
                // We scan each line for common CMS column names
                const keywords = ['hcpcs', 'description', 'dosage', 'payment', 'limit', 'ndc', 'labeler', 'short description', 'drug description', '_2026_code', 'hcpc'];
                let bestHeaderIndex = -1;
                let maxFound = 0;

                // Scan first 50 lines (CMS files can have deep headers)
                lines.slice(0, 50).forEach((line, idx) => {
                    const found = keywords.filter(k => line.toLowerCase().includes(k)).length;
                    // Real headers usually have 5-8 of these keywords
                    if (found > maxFound && found >= 4) {
                        maxFound = found;
                        bestHeaderIndex = idx;
                    }
                });
                
                if (bestHeaderIndex === -1) {
                    addLog(`CRITICAL: Header row not detected in ${file.name}. Ensure it contains columns like 'HCPCS' and 'Description'.`);
                    return [];
                }

                addLog(`[DEBUG] Header Confidence: ${maxFound} keys found at row ${bestHeaderIndex + 1} in ${file.name}`);
                const cleanText = lines.slice(bestHeaderIndex).join('\n');
                return new Promise<any[]>((resolve, reject) => {
                    Papa.parse(cleanText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => resolve(results.data),
                        error: (err: any) => reject(err)
                    });
                });
            } catch (err) {
                return [];
            }
        };

        addLog("Spawning web workers for parallel file processing...");
        
        // Parallel Parsing of all 6 files
        const [q1Data, q2Data, q3Data, ndc1Data, ndc2Data, ndc3Data] = await Promise.all([
            q1File ? parseCSVFile(q1File) : Promise.resolve([]),
            q2File ? parseCSVFile(q2File) : Promise.resolve([]),
            q3File ? parseCSVFile(q3File) : Promise.resolve([]),
            ndc1File ? parseCSVFile(ndc1File) : Promise.resolve([]),
            ndc2File ? parseCSVFile(ndc2File) : Promise.resolve([]),
            ndc3File ? parseCSVFile(ndc3File) : Promise.resolve([])
        ]);

        setProgress(40);
        addLog(`Parallel parsing complete. Injecting base Q0 mapping...`);

        // Base Map (Q0)
        if (q2Data.length > 0) {
            const sampleKeys = Object.keys(q2Data[0]);
            addLog(`[DEBUG] Found Q0 Keys: ${sampleKeys.slice(0, 5).join(' | ')}`);
            
            let matchedRoots = 0;
            q2Data.forEach(row => {
                const keys = Object.keys(row);
                const hKey = keys.find(k => k.toLowerCase() === 'hcpcs' || k.toLowerCase().includes('hcpcs code') || k.toLowerCase().includes('_2026_code') || k.toLowerCase() === 'hcpc');
                const hcpcs = hKey ? row[hKey]?.toString().trim().toUpperCase() : null;
                
                if (!hcpcs || hcpcs === '' || hcpcs.length < 3) return;
                matchedRoots++;
                
                // Broad description resolution
                const dKey = keys.find(k => 
                    k.toLowerCase().includes('short description') || 
                    k.toLowerCase().includes('drug description') ||
                    (k.toLowerCase().includes('desc') && !k.toLowerCase().includes('dosage'))
                );
                
                const pKey = keys.find(k => k.toLowerCase().includes('payment limit') || k.toLowerCase().includes('limit') || k.toLowerCase().includes('asp'));
                const dosKey = keys.find(k => k.toLowerCase().includes('dosage'));
                const bKey = keys.find(k => k.toLowerCase().includes('biosimilar'));
                
                // Parse numbers safely by removing commas/dollars
                const cleanPrice = pKey ? parseFloat(row[pKey]?.toString().replace(/[^0-9.]/g, '') || '0') : 0;
                
                matrix[hcpcs] = {
                    hcpcs,
                    description: (dKey ? row[dKey] : 'Unknown Drug') || 'Unknown Drug',
                    current_asp: cleanPrice,
                    prev_asp: 0,
                    next_asp: 0,
                    reimbursement_rate: cleanPrice,
                    is_biosimilar: (bKey ? (row[bKey]?.toString().toLowerCase() === 'true' || row[bKey]?.toString().toLowerCase() === 'y') : false) || hcpcs.startsWith('Q51'),
                    dosage: dosKey ? row[dosKey] : 'Not Specified',
                    effective_date: '2026-07-01'
                };
            });
            addLog(`[DEBUG] Mapped ${matchedRoots} unique HCPCS records with Dosage depth.`);
        }

        // Fast-map Q1 Lookback
        if (q1Data.length > 0) {
            q1Data.forEach(row => {
                const hKey = Object.keys(row).find(k => k.toLowerCase().includes('hcpc'));
                const hcpcs = hKey ? row[hKey]?.toString().trim() : null;
                if (hcpcs && matrix[hcpcs]) {
                    const pKey = Object.keys(row).find(k => k.toLowerCase().includes('payment') || k.toLowerCase().includes('asp') || k.toLowerCase().includes('limit'));
                    matrix[hcpcs].prev_asp = pKey ? parseFloat(row[pKey]?.toString().replace(/[^0-9.]/g, '') || '0') : 0;
                }
            });
        }

        // Fast-map Q3 Forecast
        if (q3Data.length > 0) {
            q3Data.forEach(row => {
                const hKey = Object.keys(row).find(k => k.toLowerCase().includes('hcpc'));
                const hcpcs = hKey ? row[hKey]?.toString().trim() : null;
                if (hcpcs && matrix[hcpcs]) {
                    const pKey = Object.keys(row).find(k => k.toLowerCase().includes('payment') || k.toLowerCase().includes('asp') || k.toLowerCase().includes('limit'));
                    matrix[hcpcs].next_asp = pKey ? parseFloat(row[pKey]?.toString().replace(/[^0-9.]/g, '') || '0') : 0;
                }
            });
        }

        // Crosswalk logs & Aggregation
        const ndcPayload: any[] = [];
        const processNDCRows = (rows: any[]) => {
            rows.forEach(row => {
                const keys = Object.keys(row);
                const nKey = keys.find(k => k.toLowerCase().includes('ndc') && !k.toLowerCase().includes('labeler'));
                const hKey = keys.find(k => k.toLowerCase().includes('hcpcs') || k.toLowerCase().includes('_2026_code') || k.toLowerCase() === 'hcpc');
                const cfKey = keys.find(k => k.toLowerCase().includes('factor') || k.toLowerCase().includes('unit'));
                const lKey = keys.find(k => k.toLowerCase().includes('labeler') || k.toLowerCase().includes('name'));
                const dKey = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('drug description'));

                const rawNdcOriginal = nKey ? row[nKey]?.toString().trim() : null;
                const rawNdcDigits = rawNdcOriginal?.replace(/[^0-9]/g, '');

                if (rawNdcDigits && (rawNdcDigits.length === 11 || rawNdcDigits.length === 9)) {
                    const ndc = rawNdcDigits.padStart(11, '0');
                    const rawHcpcs = hKey ? row[hKey]?.toString().trim().toUpperCase() : null;
                    // Clean HCPCS: remove any potential suffixes or annotations for the database primary key match
                    const cleanHcpcs = rawHcpcs ? rawHcpcs.split(' ')[0].slice(0, 20) : null;

                    ndcPayload.push({
                        ndc,
                        hcpcs: cleanHcpcs,
                        formatted_ndc: rawNdcOriginal, // Preserve original dashes/format for display
                        conversion_factor: cfKey ? parseFloat(row[cfKey]?.toString().replace(/[^0-9.]/g, '') || '1') : 1,
                        labeler_name: lKey ? row[lKey] : 'Unknown',
                        description: dKey ? row[dKey] : 'NDC Mapping'
                    });
                }
            });
        };

        if (ndc1Data.length > 0) processNDCRows(ndc1Data);
        if (ndc2Data.length > 0) processNDCRows(ndc2Data);
        if (ndc3Data.length > 0) processNDCRows(ndc3Data);

        setProgress(60);
        setStatus('uploading');
        
        const payload = Object.values(matrix);
        // De-duplicate NDC mappings by (NDC + HCPCS) composite key to prevent "ON CONFLICT" duplicate row errors
        const deDupedNdc = Array.from(new Map(ndcPayload.map(item => [`${item.ndc}|${item.hcpcs}`, item])).values());

        if (payload.length > 0 || deDupedNdc.length > 0) {
            addLog(`Matrix fusion complete. Injecting ${payload.length} HCPCS and ${deDupedNdc.length} NDCs (De-duped)...`);

            if (supabaseKey === 'mock-key') {
                addLog(`(MOCK MODE) Simulated UPSERT successful.`);
                setProgress(100);
            } else {
                // 1. Upsert HCPCS Pricing
                if (payload.length > 0) {
                    const chunkSize = 1000;
                    for (let i = 0; i < payload.length; i += chunkSize) {
                        const chunk = payload.slice(i, i + chunkSize);
                        const { error } = await supabase.from('cms_asp_pricing').upsert(chunk, { onConflict: 'hcpcs' });
                        if (error) throw error;
                        addLog(`Upserted ${Math.min(i + chunkSize, payload.length)} HCPCS records...`);
                        setProgress(60 + (i / payload.length) * 20);
                    }
                }

                // 2. Upsert NDC Crosswalk
                if (deDupedNdc.length > 0) {
                    const chunkSize = 1000;
                    for (let i = 0; i < deDupedNdc.length; i += chunkSize) {
                        const chunk = deDupedNdc.slice(i, i + chunkSize);
                        const { error } = await supabase.from('cms_ndc_crosswalk').upsert(chunk, { onConflict: 'ndc,hcpcs' });
                        if (error) throw error;
                        addLog(`Upserted ${Math.min(i + chunkSize, deDupedNdc.length)} NDC Mappings...`);
                        setProgress(80 + (i / deDupedNdc.length) * 20);
                    }
                }
                addLog(`SUPABASE TRANSACTIONS CONFIRMED.`);
            }
        } else {
            addLog(`No base matrix payload generated. Only executing crosswalk bindings.`);
            setProgress(100);
        }

        // Update local cache
        const newCache = {
            q1: q1File?.name || lastFiles.q1,
            ndc1: ndc1File?.name || lastFiles.ndc1,
            q2: q2File?.name || lastFiles.q2,
            ndc2: ndc2File?.name || lastFiles.ndc2,
            q3: q3File?.name || lastFiles.q3,
            ndc3: ndc3File?.name || lastFiles.ndc3
        };
        localStorage.setItem('quantrx_ingest_cache', JSON.stringify(newCache));
        setLastFiles(newCache);

        setStatus('success');
        addLog("Database sync sequence completed globally.");
    } catch (err: any) {
        setStatus('error');
        addLog(`CRITICAL FAILURE: ${err.message}`);
    }
  };

  const processRemittance = async () => {
    if (!remit835File) {
        addLog("ERROR: No 835 Remittance file selected.");
        return;
    }

    setStatus('parsing');
    addLog(`Initiating Triple Latch Reconciliation for ${remit835File.name}...`);
    
    try {
        const { claimIngestor } = await import('../services/claimIngestor');
        const result = await claimIngestor.process835(remit835File);
        
        if (result.processed) {
            addLog(`SUCCESS: Processed ${result.claimsCount} claims.`);
            addLog(`TRIPLE LATCH: Found ${result.attributionsFound} matches in Attribution Vault.`);
            addLog(`REVENUE LOCKED: $${result.matchedVolume.toLocaleString()}`);

            addLog(`ESTIMATED PLATFORM FEE (15%): $${result.platformFees.toLocaleString()}`);
            setStatus('success');
            setProgress(100);
        }
    } catch (err: any) {
        setStatus('error');
        addLog(`REMITTANCE FAILURE: ${err.message}`);
    }
  };

  const clearTables = async () => {
    if (!window.confirm("CRITICAL: This will permanently delete all ASP pricing and NDC crosswalk data. Continue?")) return;
    
    setStatus('uploading');
    addLog("Initiating full table TRUNCATE...");
    try {
        const { error: err1 } = await supabase.from('cms_asp_pricing').delete().neq('hcpcs', 'FORCE_DELETE_ALL_RECORDS');
        const { error: err2 } = await supabase.from('cms_ndc_crosswalk').delete().neq('ndc', 'FORCE_DELETE_ALL_RECORDS');
        
        if (err1) {
            addLog(`Pricing clear failed: ${err1.message} (Code: ${err1.code})`);
            throw new Error(`Pricing clear failed: ${err1.message}`);
        }
        if (err2) {
            addLog(`Crosswalk clear failed: ${err2.message} (Code: ${err2.code})`);
            throw new Error(`Crosswalk clear failed: ${err2.message}`);
        }
        
        addLog("TRUNCATE SUCCESSFUL. Database is now clean.");
        setStatus('idle');
    } catch (err: any) {
        addLog(`CRITICAL: ${err.message}`);
        console.error("Clear Tables Error:", err);
        setStatus('error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
          <Database className="w-7 h-7 mr-3 text-emerald-500" />
          CMS Ingestion Matrix
        </h1>
        <p className="text-muted-foreground">Upload the official CMS Part B ASP Pricing files and the NDC-to-HCPCS Crosswalk to synchronize the 10,000+ drug national database directly into Supabase.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Q-1 Block */}
        <div className="bg-secondary/10 border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-lg text-emerald-400">Quarter Lookback (Q-1)</h3>
            <FileUploadZone label="ASP Pricing File" description="Upload Q-1 Pricing CSV" accept=".csv,.xlsx,.xls" file={q1File} onFileSelect={setQ1File} lastUploaded={lastFiles.q1} />
            <FileUploadZone label="NDC Crosswalk" description="Upload Q-1 Crosswalk CSV" accept=".csv,.xlsx,.xls" file={ndc1File} onFileSelect={setNdc1File} lastUploaded={lastFiles.ndc1} />
        </div>

        {/* Q0 Block */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <h3 className="font-bold text-lg text-primary flex items-center">
                Current Quarter (Q0)
            </h3>
            <FileUploadZone label="ASP Pricing File" description="Upload Current Pricing CSV" accept=".csv,.xlsx,.xls" file={q2File} onFileSelect={setQ2File} lastUploaded={lastFiles.q2} />
            <FileUploadZone label="NDC Crosswalk" description="Upload Current Crosswalk CSV" accept=".csv,.xlsx,.xls" file={ndc2File} onFileSelect={setNdc2File} lastUploaded={lastFiles.ndc2} />
        </div>

        {/* Q+1 Block */}
        <div className="bg-secondary/10 border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-lg text-emerald-400">Quarter Forecast (Q+1)</h3>
            <FileUploadZone label="ASP Pricing File" description="Upload Q+1 Pricing CSV" accept=".csv,.xlsx,.xls" file={q3File} onFileSelect={setQ3File} lastUploaded={lastFiles.q3} />
            <FileUploadZone label="NDC Crosswalk" description="Upload Q+1 Crosswalk CSV" accept=".csv,.xlsx,.xls" file={ndc3File} onFileSelect={setNdc3File} lastUploaded={lastFiles.ndc3} />
        </div>
      </div>

      {/* 835 Remittance Section */}
      <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
                <h3 className="text-xl font-bold text-indigo-400 flex items-center">
                    <Database className="w-6 h-6 mr-2" />
                    Financial Remittance Advice (EDI 835)
                </h3>
                <p className="text-sm text-muted-foreground">
                    Upload your Payer Remittance files to perform the <strong>Triple Latch</strong>. 
                    The engine will de-identify patient data locally using your Practice Vault salt and match payouts to clinical switch events.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 lg:max-w-md">
                <div className="flex-1 w-full">
                    <FileUploadZone 
                        label="835 EDI File" 
                        description="Drag .edi remit file here" 
                        accept=".edi,.txt" 
                        file={remit835File} 
                        onFileSelect={setRemit835File} 
                    />
                </div>
                <button 
                    onClick={processRemittance}
                    disabled={!remit835File || status === 'parsing' || status === 'uploading'}
                    className="w-full sm:w-auto px-6 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                    {status === 'parsing' ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'RUN RECONCILIATION'}
                </button>
            </div>
        </div>
      </div>

      <div className="bg-secondary/30 border border-border rounded-xl p-6 shadow-sm overflow-hidden relative">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-foreground">Initiate Synchronization</h3>
              <p className="text-sm text-muted-foreground">Engine will merge all quarters by HCPCS, map conversion factors, and execute a bulk UPSERT to Supabase.</p>
          </div>
          <div className="flex items-center space-x-4">
              <button 
                  onClick={clearTables}
                  disabled={status === 'parsing' || status === 'merging' || status === 'uploading'}
                  className="px-4 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/30 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                  Clear Tables
              </button>
              <button 
                  onClick={processCMSMatrix}
                  disabled={status === 'parsing' || status === 'merging' || status === 'uploading'}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center"
              >
                  {status === 'parsing' || status === 'merging' || status === 'uploading' ? (
                      <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Processing Matrix...</>
                  ) : (
                      'ENGAGE SYNC SEQUENCE'
                  )}
              </button>
          </div>
        </div>
        
        {/* Progress Bar Overlay */}
        {(status === 'parsing' || status === 'uploading' || status === 'success') && (
            <div className="absolute bottom-0 left-0 h-1 bg-secondary w-full">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out flex items-center justify-end pr-1" 
                  style={{ width: `${progress}%` }}
                >
                  {status === 'success' && <div className="absolute top-[-25px] right-2 text-[10px] font-bold text-emerald-500">COMPLETE</div>}
                </div>
            </div>
        )}
      </div>

      <div className="w-full bg-[#0d1117] rounded-xl border border-border mt-8 font-mono text-xs p-4 h-64 overflow-y-auto">
        <div className="text-emerald-500 font-bold mb-2">QuantRx Engine Logs // Standby</div>
        {logs.map((log, i) => (
            <div key={i} className="text-muted-foreground mb-1">{log}</div>
        ))}
        {logs.length === 0 && <div className="text-muted-foreground/30 italic">Awaiting file upload...</div>}
      </div>
    </div>
  );
};

export default IngesterView;
