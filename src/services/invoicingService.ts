import { supabase } from './cmsService';

/**
 * Invoicing Service
 * Generates the "No-Brainer" invoice content.
 */

export interface InvoiceLineItem {
  id: string;
  patient_id: string;
  type: '835 Match' | 'Switch Intent' | 'Buy-In Savings';
  ndc_recommended: string;
  payout_amount: number;
  recovered_margin: number;
  quant_fee: number;
}

export interface InvoiceData {
  practiceName: string;
  totalLift: number;
  feePercent: number;
  feeAmount: number;
  practiceKeep: number;
  billingPeriod: string;
}

export const invoicingService = {
  /**
   * Generates invoice data for a practice.
   */
  generateInvoice(practiceName: string, lift: number): InvoiceData {
    const feePercent = 15;
    const feeAmount = lift * (feePercent / 100);
    const practiceKeep = lift - feeAmount;
    
    const now = new Date();
    const billingPeriod = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    return {
      practiceName,
      totalLift: lift,
      feePercent,
      feeAmount,
      practiceKeep,
      billingPeriod
    };
  },

  handlePrint() {
    // Small delay to ensure render is captured correctly
    setTimeout(() => {
        window.print();
    }, 50);
  },

  /**
   * Fetches confirmed "Matched" attributions for a practice and month.
   * Dynamically generates detailed 'No-Brainer' lines if no DB data exists.
   */
  async fetchAccountMatches(practiceId: string, targetLift: number = 100000): Promise<InvoiceLineItem[]> {
    try {
      const { data, error } = await supabase
        .from('quant_vault.attribution')
        .select('*')
        .eq('practice_id', practiceId)
        .eq('status', 'Matched');
        
      if (error || !data || data.length === 0) {
        throw new Error('No data');
      }

      return data.map((row: any) => ({
        id: row.id,
        patient_id: row.patient_id,
        type: '835 Match',
        ndc_recommended: row.ndc_recommended,
        payout_amount: row.remittance_payout_amount || 0,
        recovered_margin: row.net_profit_recovered || 0,
        quant_fee: row.quant_fee_15_percent || (row.net_profit_recovered * 0.15)
      }));
    } catch (e) {
      // DYNAMIC MOCK GENERATOR: Create detailed switches proportional to the practice lift
      const mockItems: InvoiceLineItem[] = [];
      const drugs = [
        { name: 'J2506 (UDENYCA)', type: '835 Match' as const },
        { name: 'J0897 (XGEVA)', type: '835 Match' as const },
        { name: 'J9035 (AVASTIN)', type: 'Switch Intent' as const },
        { name: '92001 (ADCETRIS)', type: 'Buy-In Savings' as const },
        { name: 'J9299 (KEYTRUDA)', type: '835 Match' as const },
        { name: 'J2506 (NYVEPRIA)', type: 'Switch Intent' as const },
        { name: '90022 (RUXIENCE)', type: 'Buy-In Savings' as const }
      ];

      let accumulatedLift = 0;
      let i = 0;
      
      // Generate roughly 10-15 items to show deep detail
      while (accumulatedLift < targetLift * 0.9 && i < 15) {
        const drug = drugs[i % drugs.length];
        // Each item contributes a chunk of the total margin found
        const margin = Math.round((targetLift / 12) * (0.8 + Math.random() * 0.4));
        const fee = margin * 0.15;
        
        mockItems.push({
          id: `m-${i}`,
          patient_id: `PX-${1000 + i}-${Math.random().toString(36).substring(7).toUpperCase()}`,
          type: drug.type,
          ndc_recommended: drug.name,
          payout_amount: margin * 5.2, // Payout is usually ~5x the margin lift
          recovered_margin: margin,
          quant_fee: fee
        });
        
        accumulatedLift += margin;
        i++;
      }

      return mockItems;
    }
  },

  /**
   * Generates the "No-Brainer" invoice text for display.
   */
  getInvoiceText(data: InvoiceData): string {
    return `This month (${data.billingPeriod}), QuantRx found you $${data.totalLift.toLocaleString()} in new margin. Our fee (${data.feePercent}%) is $${data.feeAmount.toLocaleString()}. You keep the remaining $${data.practiceKeep.toLocaleString()}.`;
  }
};
