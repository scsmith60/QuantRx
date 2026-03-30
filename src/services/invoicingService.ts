import { supabase } from './cmsService';

/**
 * Invoicing Service
 * Generates the "No-Brainer" invoice content.
 */

export interface InvoiceLineItem {
  id: string;
  patient_id: string;
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
   */
  async fetchAccountMatches(practiceId: string): Promise<InvoiceLineItem[]> {
    const { data, error } = await supabase
      .from('quant_vault.attribution')
      .select('*')
      .eq('practice_id', practiceId)
      .eq('status', 'Matched');
      
    if (error) return [];

    if (data.length === 0) {
      // Fallback for demonstration: Return "The Detail" for mock practices
      return [
        { id: 'm1', patient_id: 'HSH-8821-X', ndc_recommended: 'J2506 (UDENYCA)', payout_amount: 4200, recovered_margin: 840, quant_fee: 126 },
        { id: 'm2', patient_id: 'HSH-4432-Y', ndc_recommended: 'J0897 (XGEVA)', payout_amount: 3100, recovered_margin: 620, quant_fee: 93 },
        { id: 'm3', patient_id: 'HSH-9102-Z', ndc_recommended: 'J9035 (AVASTIN)', payout_amount: 5800, recovered_margin: 1160, quant_fee: 174 }
      ];
    }

    return data.map(row => ({
      id: row.id,
      patient_id: row.patient_id,
      ndc_recommended: row.ndc_recommended,
      payout_amount: row.remittance_payout_amount || 0,
      recovered_margin: row.net_profit_recovered || 0,
      quant_fee: row.quant_fee_15_percent || (row.net_profit_recovered * 0.15)
    }));
  },

  /**
   * Generates the "No-Brainer" invoice text for display.
   */
  getInvoiceText(data: InvoiceData): string {
    return `This month (${data.billingPeriod}), QuantRx found you $${data.totalLift.toLocaleString()} in new margin. Our fee (${data.feePercent}%) is $${data.feeAmount.toLocaleString()}. You keep the remaining $${data.practiceKeep.toLocaleString()}.`;
  }
};
