import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import type { InvoiceData, InvoiceLineItem } from '../services/invoicingService';


interface InvoiceTemplateProps {
    data: InvoiceData;
    lineItems: InvoiceLineItem[];
    onClose: () => void;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data, lineItems, onClose }) => {
    
    const handlePrint = () => {
        // 100ms delay allows the React state and CSS to fully settle before print capture
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center overflow-y-auto pt-10 pb-20 print:p-0 print:bg-white print:static print:inset-auto print-container">
            <style>
                {`
                @media print {
                    /* Surgery: Hide everything else but the root of our modal chain */
                    aside, header, main { display: none !important; }

                    .print-container {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        z-index: 9999 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        visibility: visible !important;
                    }
                    .print-content {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 1.5cm !important;
                        background: white !important;
                        color: black !important;
                        border: none !important;
                        box-shadow: none !important;
                        visibility: visible !important;
                    }
                    .print-hidden { display: none !important; }
                    .print-swirly {
                        opacity: 0.1 !important;
                        color: #39FF14 !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
                `}
            </style>
            
            {/* Action Bar (Hidden when printing) */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-6 print:hidden print-hidden">
                <button onClick={onClose} className="text-white/60 hover:text-white flex items-center space-x-2">
                    <span>✕ Cancel Export</span>
                </button>
                <button 
                  onClick={handlePrint}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-xs shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                >
                    Confirm & Download PDF
                </button>
            </div>

            {/* The Actual Sheet */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[800px] bg-[#0d1117] rounded-3xl border border-white/10 p-16 space-y-12 shadow-2xl relative overflow-hidden print-content"
            >
                {/* Global Swirly Helix (Behind Logo) */}
                <div className="absolute top-8 left-8 w-48 h-48 opacity-10 pointer-events-none print-swirly">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                        <path
                            d="M50,10 Q60,30 40,50 Q60,70 50,90"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                        <path
                            d="M50,10 Q40,30 60,50 Q40,70 50,90"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                </div>

                {/* Logo Backdrop (Modern Accent) */}
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none print:hidden"></div>

                {/* Header */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-2xl">Q</div>
                            <div className="flex flex-col">
                                <span className="text-2xl tracking-tighter text-white print:text-black">
                                    <span className="font-light tracking-widest">QUANT</span>
                                    <span className="text-primary font-black ml-1">RX</span>
                                </span>
                                <span className="text-[10px] text-primary font-bold uppercase tracking-[0.3em]">Maximizing Margin Per Dose</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest print:text-gray-500">BILLED TO</p>
                            <h2 className="text-2xl font-bold text-white print:text-black">{data.practiceName}</h2>
                            <p className="text-xs text-muted-foreground print:text-gray-500">Practice ID: {data.practiceName.slice(0, 4).toUpperCase()}-2026</p>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl print:border-gray-200">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest print:text-gray-500">INVOICE NO.</p>
                            <p className="text-lg font-mono font-bold text-white print:text-black">QRX-MAR-2026</p>
                        </div>
                        <p className="text-xs text-muted-foreground print:text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* No-Brainer Summary Line */}
                <div className="p-10 bg-primary/5 border border-primary/20 rounded-3xl relative overflow-hidden print:border-gray-200 print:bg-gray-50">
                    <div className="relative z-10">
                        <p className="text-sm italic font-medium leading-relaxed text-slate-300 print:text-gray-700">
                             "This cycle, QuantRx identified <span className="text-primary font-bold">${data.totalLift.toLocaleString()}</span> in verified clinical margin. 
                             Our fee (15%) is based strictly on these confirmed switches. 
                             You keep the remaining <span className="text-white font-black print:text-black">${data.practiceKeep.toLocaleString()}</span>."
                        </p>
                    </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pb-4 border-b border-white/5 print:border-gray-200 print:text-gray-500">Verified Clinical Switches (EDI 835 Matched)</h4>
                    <table className="w-full text-sm">
                        <thead className="text-left text-muted-foreground print:text-gray-500">
                            <tr>
                                <th className="pb-4 font-bold text-[10px] uppercase">Patient (Secure Hash)</th>
                                <th className="pb-4 font-bold text-[10px] uppercase">HCPCS / NDC</th>
                                <th className="pb-4 font-bold text-[10px] uppercase text-right">Margin Found</th>
                                <th className="pb-4 font-bold text-[10px] uppercase text-right">Yield Fee</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 print:divide-gray-100">
                            {lineItems.length > 0 ? lineItems.map((item, idx) => (
                                <tr key={idx} className="group">
                                    <td className="py-4 font-mono text-[11px] text-white/60 print:text-black">#{item.patient_id.slice(0, 8)}...</td>
                                    <td className="py-4 text-white print:text-black font-medium">{item.ndc_recommended}</td>
                                    <td className="py-4 text-right text-emerald-400 font-bold print:text-black">${item.recovered_margin.toLocaleString()}</td>
                                    <td className="py-4 text-right text-primary font-bold print:text-black">${item.quant_fee.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-muted-foreground italic">No verified switches detected for this cycle. No fee is due.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Totals */}
                <div className="pt-8 border-t border-white/10 flex justify-end print:border-gray-200">
                    <div className="w-full max-w-xs space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground print:text-gray-500 font-bold">Aggregate Margin Recovery</span>
                            <span className="text-white print:text-black font-bold font-mono">${data.totalLift.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl pt-4 border-t border-white/5 print:border-gray-100">
                            <span className="text-white print:text-black font-black tracking-tighter">TOTAL FEE DUE</span>
                            <span className="text-primary font-black font-mono [text-shadow:0_0_30px_rgba(57,255,20,0.3)] print:text-black">${data.feeAmount.toLocaleString()}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase text-right leading-relaxed print:text-gray-400">
                            Terms: Net 15. Invoice is generated based on verified Triple Latch reconciliation of EDI 835 Remittance Advice and Clinical Switch Intents.
                        </p>
                    </div>
                </div>

                {/* Secure Badge */}
                <div className="mt-16 flex items-center justify-center space-x-2 pt-8 border-t border-white/5 opacity-40 grayscale hover:grayscale-0 transition-all print:border-gray-200">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-mono tracking-widest text-[#39FF14] uppercase">QuantRx Sovereign Integrity Protected // RLS_AES_256</span>
                </div>
            </motion.div>
        </div>
    );
};

export default InvoiceTemplate;
