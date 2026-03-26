import { cmsService } from './cmsService';

interface ContractTerms {
  wholesalerPrice: number;
  gpoRebatePercent: number;
  mfgRebateAmount: number;
}

export const rebateEngine = {
  /**
   * Calculates the True Net Cost of a drug by stacking all applicable rebates.
   * Formula: Net = Wholesale - (Wholesale * GPO%) - (Wholesale * Dist%) - MFG Rebate
   */
  async calculateTrueNetCost(ndc: string): Promise<number> {
    const contract = await cmsService.getVaultContract(ndc);
    if (!contract) return 0;
    
    // 1. Start with Wholesaler Invoice Price from Vault
    const wholesale = Number(contract.wholesaler_invoice_price);
    
    // 2. Apply Practice-Specific GPO Rebate
    const gpoPct = Number(contract.gpo_rebate_percentage) || 0;
    const gpoSavings = (wholesale * gpoPct) / 100;
    
    // 3. Apply Fixed Manufacturer Subvention/Rebate
    const mfgRebate = Number(contract.mfg_rebate_amount) || 0;
    
    return wholesale - gpoSavings - mfgRebate;
  },

  calculateMedicalMargin(reimbursement: number, netCost: number): number {
    return Math.max(0, reimbursement - netCost);
  },

  /**
   * QuantRx Platform Fee (15% of recovered profit)
   */
  calculatePlatformFee(profit: number): number {
    return profit * 0.15;
  }
};
