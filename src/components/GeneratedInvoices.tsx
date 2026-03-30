import { invoicingService } from '../services/invoicingService';
import type { InvoiceData, InvoiceLineItem } from '../services/invoicingService';
import { Download, CheckCircle2, Loader2 } from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';
import React, { useState } from 'react';

const MOCK_PRACTICES = [
  { id: '1', name: 'Oncology Associates of NJ', lift: 124500 },
  { id: '2', name: 'Texas Cancer Specialists', lift: 450000 },
  { id: '4', name: 'Seattle Cancer Care', lift: 210000 },
];

const GeneratedInvoices: React.FC = () => {
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleOpenPDF = async (practiceName: string, lift: number, id: string) => {
        setLoadingId(id);
        const invoice = invoicingService.generateInvoice(practiceName, lift);
        const matches = await invoicingService.fetchAccountMatches('SYSTEM_MOCK_ID', lift); 
        
        setSelectedInvoice(invoice);
        setLineItems(matches);
        setLoadingId(null);
    };

    return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Automated Invoicing</h2>
        <p className="text-muted-foreground italic">"The No-Brainer Invoice: We find $100k, you keep $85k."</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {MOCK_PRACTICES.map((p) => {
          const invoice = invoicingService.generateInvoice(p.name, p.lift);
          const invoiceText = invoicingService.getInvoiceText(invoice);

          return (
            <div key={p.id} className="p-8 rounded-2xl border border-border glass-panel relative group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3 relative">
                    {/* Repositioned Swirly Helix (Centered perfectly behind Q) */}
                    <div className="absolute left-[24px] top-[24px] -translate-x-1/2 -translate-y-1/2 w-20 h-20 opacity-20 pointer-events-none print-swirly z-[-1]">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                            <path
                                d="M50,10 Q60,30 40,50 Q60,70 50,90"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                            <path
                                d="M50,10 Q40,30 60,50 Q40,70 50,90"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />
                        </svg>
                    </div>

                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-2xl relative shadow-lg">Q</div>
                    <div>
                        <h3 className="text-xl font-bold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground italic tracking-tight">{invoice.billingPeriod} Cycle</p>
                    </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenPDF(p.name, p.lift, p.id)}
                    disabled={loadingId === p.id}
                    className="px-3 py-1.5 border border-border rounded-lg text-xs font-semibold hover:bg-secondary transition-colors flex items-center space-x-2"
                  >
                    {loadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>PDF</span>
                  </button>
                  <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Send Invoice</span>
                  </button>
                </div>
              </div>

              <div className="bg-background/80 rounded-xl p-6 border border-border/50 mb-6 border-l-4 border-l-primary/50">
                <p className="text-sm leading-relaxed font-mono opacity-90 italic">
                   {`"${invoiceText}"`}
                </p>
              </div>

              <div className="flex items-center space-x-12 px-2">
                <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Found Margin</p>
                   <p className="text-xl font-mono font-bold">${invoice.totalLift.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1 font-bold text-primary">QuantRx Fee (15%)</p>
                   <p className="text-xl font-mono font-bold text-primary">${invoice.feeAmount.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Practice Keeps</p>
                   <p className="text-xl font-mono font-bold">${invoice.practiceKeep.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedInvoice && (
          <InvoiceTemplate 
            data={selectedInvoice} 
            lineItems={lineItems} 
            onClose={() => setSelectedInvoice(null)} 
          />
      )}
    </div>
  );
};

export default GeneratedInvoices;
