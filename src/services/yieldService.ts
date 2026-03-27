import { cmsService, supabase } from './cmsService';
import { rebateEngine } from './rebateEngine';

export interface StrategyOption {
    type: 'BUY_IN' | 'SWITCH' | 'NONE';
    title: string;
    description: string;
    potentialSavings: number;
    strategyFee: number;
    actionLabel: string;
    data?: any;
}

class YieldService {
    private capturedFees: number = 0;

    async findBestClinicalRecommendation(hcpcs: string): Promise<{ ndc: string; margin: number; description: string } | null> {
        // Oncology Biosimilar Mapping (MVP Heuristic)
        const exchangeableHcpcs: Record<string, string[]> = {
            'J9035': ['J9035', 'Q5126', 'Q5129', 'Q5107'], // Bevacizumab (Avastin, Alymsys, etc)
            'J2506': ['J2506', 'J1447', 'Q5111', 'Q5122'], // Pegfilgrastim (Neulasta, Ziextenzo, Udenyca)
            'J1745': ['J1745', 'Q5103', 'Q5104']          // Infliximab (Remicade, Inflectra)
        };

        const targetHcpcs = exchangeableHcpcs[hcpcs] || [hcpcs];
        let bestNDC = null;
        let maxMargin = -1000000;

        for (const code of targetHcpcs) {
            const candidates = await cmsService.getNDCsByHCPCS(code);
            for (const candidate of candidates) {
                const master = await cmsService.getMasterInfo(candidate.ndc);
                const netCost = await rebateEngine.calculateTrueNetCost(candidate.ndc);
                
                if (netCost === 0 || !master) continue;

                // ASP logic: If we are switching TO this HCPCS, use its specific ASP
                const hcpcsRecord = cmsService.getASPByHCPCS(code);
                const currentAsp = hcpcsRecord?.aspPrice || 1200;
                
                const margin = rebateEngine.calculateMedicalMargin(currentAsp, netCost);
                
                if (margin > maxMargin) {
                    maxMargin = margin;
                    bestNDC = {
                        ndc: candidate.ndc,
                        margin: margin,
                        description: master.brand_name
                    };
                }
            }
        }

        return bestNDC;
    }

    /**
     * Analyzes a drug for optimization opportunities
     */
    async getOptimizationStrategy(hcpcs: string, patients: any[]): Promise<StrategyOption> {
        const record = cmsService.getASPByHCPCS(hcpcs);
        if (!record) return { type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' };

        const affectingPatients = patients.filter(p => p.orderHcpcs === hcpcs).length;
        // Business logic: 1 patient needs ~3 vials per quarter (approx. monthly visit)
        const vialsPerQuarter = affectingPatients * 3;

        // 1. Calculate Buy-In Savings (Lookforward)
        const buyInSavings = record.nextASP > record.aspPrice 
            ? (record.nextASP - record.aspPrice) * vialsPerQuarter 
            : 0;

        // 2. Clinical Recommendation Logic
        const rec = await this.findBestClinicalRecommendation(hcpcs);
        let switchSavings = 0;
        if (rec) {
            switchSavings = rec.margin * affectingPatients; // Simulating 1 vial per patient for the switch demo
        }

        if (switchSavings > buyInSavings && switchSavings > 0 && rec) {
            return {
                type: 'SWITCH',
                title: 'BIOSIMILAR CONVERSION OPPORTUNITY',
                description: `You have ${affectingPatients} patients on ${record.description}. Switching to ${rec.description} based on your GPO contracts could increase margin by $${switchSavings.toLocaleString()}.`,
                potentialSavings: switchSavings,
                strategyFee: switchSavings * 0.15,
                actionLabel: `SWITCH TO ${rec.description.toUpperCase()}`,
                data: rec
            };
        } else if (buyInSavings > 0 && record.aspPrice > 0) {
            const percIncrease = (((record.nextASP - record.aspPrice) / record.aspPrice) * 100).toFixed(1);
            return {
                type: 'BUY_IN',
                title: 'PROJECTED ASP INCREASE DETECTED',
                description: `ASP for ${record.description} is increasing by ${percIncrease}% next quarter. You have ${affectingPatients} patients using approx. ${vialsPerQuarter} vials/quarter. Recommend buying ${vialsPerQuarter} vials now to lock in $${buyInSavings.toLocaleString()} savings.`,
                potentialSavings: buyInSavings,
                strategyFee: buyInSavings * 0.15,
                actionLabel: 'EXECUTE BUY-IN',
                data: { vials: vialsPerQuarter, rate: record.nextASP - record.aspPrice }
            };
        }

        return { type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' };
    }

    async logSwitchEvent(patientId: string, fromHcpcs: string, toHcpcs: string, netLift: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('quant_billing')
            .insert({
                practice_id: user.id,
                patient_id: patientId,
                hcpcs_switched_from: fromHcpcs,
                hcpcs_switched_to: toHcpcs,
                net_lift_amount: netLift,
                quant_fee_15_percent: netLift * 0.15,
                status: 'Unbilled'
            });

        if (error) {
            console.error("[Yield] Error logging switch billing:", error);
        }
    }

    async logBuyInEvent(hcpcs: string, actualQuantity: number, savings: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('quant_billing')
            .insert({
                practice_id: user.id,
                hcpcs_switched_from: hcpcs, // Overloading this for buy-in tracking
                net_lift_amount: savings,
                quant_fee_15_percent: savings * 0.15,
                status: 'Unbilled',
                notes: `Purchase of ${actualQuantity} vials to lock in quarterly pricing.`
            });

        this.recordExecution(savings);

        if (error) {
            console.error("[Yield] Error logging buy-in billing:", error);
        }
    }

    recordExecution(savings: number) {
        this.capturedFees += (savings * 0.15);
    }

    getTotalStrategyFees(): number {
        return this.capturedFees;
    }

    /**
     * The "Unified Switch" Logic (The Algorithm)
     * Handles Part B (Infusion) vs Part D (Oral) optimizations.
     */
    async calculateOptimalYield(patientRequest: any): Promise<StrategyOption> {
        const { orderHcpcs, orderNdc, payer, route } = patientRequest;
        
        // Step 1: Identify Part B (Infusion) vs Part D (Oral)
        const isPartB = route === 'IV' || route === 'SubQ';
        const isPartD = route === 'Oral';

        if (isPartB) {
            // Step 2: Part B logic - CMS ASP for biosimilars
            return this.calculatePartBYield(orderHcpcs, orderNdc, patientRequest);
        } else if (isPartD) {
            // Step 3: Part D logic - Payer MAC vs Wholesaler Cost
            return this.calculatePartDYield(orderNdc, payer, patientRequest);
        }

        return { type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' };
    }

    private async calculatePartBYield(hcpcs: string, currentNdc: string, patient: any): Promise<StrategyOption> {
        const rec = await this.findBestClinicalRecommendation(hcpcs);
        if (!rec || rec.ndc === currentNdc) return { type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' };

        const netCost = await rebateEngine.calculateTrueNetCost(rec.ndc);
        const recovery = rebateEngine.calculateMedicalMargin(patient.remittancePayout || 3000, netCost);

        if (recovery > 0) {
            return {
                type: 'SWITCH',
                title: 'BIOSIMILAR CONVERSION',
                description: `Switch ${patient.name || 'Patient'} to ${rec.description}`,
                potentialSavings: recovery,
                strategyFee: recovery * 0.15,
                actionLabel: `SWITCH TO ${rec.description.toUpperCase()}`,
                data: rec
            };
        }
        return { type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' };
    }

    private async calculatePartDYield(_ndc: string, _payer: string, patient: any): Promise<StrategyOption> {
        // Step 3: Fetch Payer MAC vs Wholesaler Cost
        const alternatives = [
            { ndc: '00069-0231-02', brand: 'Tofacitinib (Generic)', cost: 450, mac: 850 },
            { ndc: '00172-2081-01', brand: 'Apotex Generic', cost: 380, mac: 850 }
        ];

        const currentCost = 1250; 
        const currentMac = 1400; 
        const currentMargin = currentMac - currentCost;

        const bestAlt = alternatives.sort((a, b) => (b.mac - b.cost) - (a.mac - a.cost))[0];
        const newMargin = bestAlt.mac - bestAlt.cost;
        const delta = newMargin - currentMargin;

        if (delta > 0) {
            return {
                type: 'SWITCH',
                title: 'GENERIC MAC OPTIMIZATION',
                description: `Switch ${patient.name || 'Patient'} to ${bestAlt.brand} (Higher MAC Spread)`,
                potentialSavings: delta,
                strategyFee: delta * 0.15,
                actionLabel: `SWITCH TO GENERIC`,
                data: { ndc: bestAlt.ndc, description: bestAlt.brand }
            };
        }

        return { type: 'NONE', title: '', description: '', potentialSavings: 0, strategyFee: 0, actionLabel: '' };
    }

    /**
     * Backward compatibility wrapper for the individual patient rows.
     */
    async calculatePatientYield(patient: any): Promise<{ strategy: StrategyOption; netCost: number }> {
        const strategy = await this.calculateOptimalYield(patient);
        const netCost = await rebateEngine.calculateTrueNetCost(patient.orderNdc);
        return { strategy, netCost };
    }

    /**
     * Forecasting Module: Watches for patent expirations in the next 180 days.
     */
    async getForecastingAlerts(): Promise<any[]> {
        return [
            {
                drug: 'Avastin',
                expiry: '2026-12-31',
                daysRemaining: 180,
                recommendation: 'Negotiate bulk rebate floors now before biosimilar entry.'
            }
        ];
    }
}

export const yieldService = new YieldService();

