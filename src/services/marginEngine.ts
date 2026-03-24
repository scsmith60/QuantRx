/**
 * QuantRx Margin Engine
 * Calculates the "Lift" based on CMS 2026 ASP Rates.
 * 
 * Legend:
 * - Brand: Neulasta (J2506) - $3,500.00
 * - Biosimilar A: Udenyca (Q5111) - $1,250.00
 * - Biosimilar B: Armlupeg (NEW) - $1,100.00
 */

export interface DrugRate {
  hcpcs: string;
  name: string;
  asp_rate: number;
}

export const DRUG_RATES: Record<string, DrugRate> = {
  J2506: { hcpcs: "J2506", name: "Neulasta (Brand)", asp_rate: 3500.00 },
  Q5111: { hcpcs: "Q5111", name: "Udenyca (Biosimilar)", asp_rate: 1250.00 },
  ARML: { hcpcs: "ARML", name: "Armlupeg (Biosimilar)", asp_rate: 1100.00 },
};

export interface LiftCalculation {
  brand_cost: number;
  biosimilar_cost: number;
  total_lift: number;
  quant_fee: number;
  practice_net: number;
}

/**
 * Calculates the revenue lift and QuantRx fee.
 * Formula: Lift = (Brand ASP + 6%) - (Biosimilar ASP + 6%)
 * For this simplified version, we use the delta of ASP.
 */
export function calculateLift(brandHcpcs: string, biosimilarHcpcs: string): LiftCalculation {
  const brand = DRUG_RATES[brandHcpcs];
  const bio = DRUG_RATES[biosimilarHcpcs];

  if (!brand || !bio) {
    throw new Error("Invalid HCPCS codes provided to margin engine.");
  }

  // CMS Reimbursement is often ASP + 6%, but QuantRx setup uses ASP + 8% target.
  const brandReimbursement = brand.asp_rate * 1.08;
  const bioReimbursement = bio.asp_rate * 1.08;
  
  // Note: The "Lift" is typically the difference in acquisition cost 
  // vs reimbursement if handled via high-yield programs, but per blueprint:
  // "Reimbursement of Recommended Drug - Reimbursement of Brand" = Lift.
  
  const totalLift = Math.abs(brandReimbursement - bioReimbursement); // Assume absolute delta is the "found money"
  const quantFee = totalLift * 0.15;
  const practiceNet = totalLift - quantFee;

  return {
    brand_cost: brandReimbursement,
    biosimilar_cost: bioReimbursement,
    total_lift: totalLift,
    quant_fee: quantFee,
    practice_net: practiceNet,
  };
}
