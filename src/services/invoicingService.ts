/**
 * Invoicing Service
 * Generates the "No-Brainer" invoice content.
 */

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

  /**
   * Generates the "No-Brainer" invoice text for display.
   */
  getInvoiceText(data: InvoiceData): string {
    return `This month (${data.billingPeriod}), QuantRx found you $${data.totalLift.toLocaleString()} in new margin. Our fee (${data.feePercent}%) is $${data.feeAmount.toLocaleString()}. You keep the remaining $${data.practiceKeep.toLocaleString()}.`;
  }
};
