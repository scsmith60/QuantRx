/**
 * QuantRx Triple Latch Rebate Engine
 * Formula: Net Profit = (Payer Reimbursement) - (Wholesaler Price - GPO Rebates - MFG Rebates)
 */

interface ContractTerms {
  wholesalerPrice: number;
  gpoRebatePercent: number;
  mfgRebateAmount: number;
}

export const rebateEngine = {
  /**
   * Calculates the True Net Cost of a drug based on practice-specific contracts.
   */
  calculateTrueNetCost(terms: ContractTerms): number {
    const gpoSavings = (terms.wholesalerPrice * terms.gpoRebatePercent) / 100;
    return terms.wholesalerPrice - gpoSavings - terms.mfgRebateAmount;
  },

  calculateMedicalMargin(aspPrice: number): number {
    // 2026 Formula: ASP + 8%
    return aspPrice * 1.08;
  },

  calculatePharmacyMargin(macPrice: number, dirFee: number): number {
    // Formula: MAC - DIR Fee
    return macPrice - dirFee;
  },

  /**
   * Calculates the profit recovery amount (The Lift) for a switch.
   * @param payerPayout The actual amount received from the 835 Remittance.
   * @param netCost The calculated True Net Cost.
   */
  calculateRecoveryProfit(payerPayout: number, netCost: number): number {
    return Math.max(0, payerPayout - netCost);
  },

  /**
   * QuantRx Platform Fee (15% of recovered profit)
   */
  calculatePlatformFee(profit: number): number {
    return profit * 0.15;
  }
};
