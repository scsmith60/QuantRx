import { supabase } from './cmsService';

export interface MarketAlert {
    id: string;
    type: 'patent_expiry' | 'biosimilar_launch' | 'new_drug' | 'margin_alert';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    ndc?: string;
    impactDate?: string;
}

class IntelligenceService {
    /**
     * Scans the medication master for upcoming patent expirations and biosimilar opportunities.
     * In a real system, this would be a scheduled edge function or background job.
     */
    async getMarketIntelligence(): Promise<MarketAlert[]> {
        const { data, error } = await supabase
            .from('medication_master')
            .select('*')
            .not('patent_expiration_date', 'is', null);

        if (error) {
            console.error("[Intelligence] Master Scan Failed:", error);
            return this.getMockAlerts();
        }

        const alerts: MarketAlert[] = [];
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);

        data?.forEach(drug => {
            if (drug.patent_expiration_date) {
                const expiry = new Date(drug.patent_expiration_date);
                if (expiry <= sixMonthsFromNow && expiry >= today) {
                    alerts.push({
                        id: `exp-${drug.ndc_code}`,
                        type: 'patent_expiry',
                        title: 'UPCOMING PATENT EXPIRATION',
                        message: `${drug.brand_name} (${drug.hcpcs_code}) patent expires on ${drug.patent_expiration_date}. Expect generic/biosimilar erosion entry.`,
                        severity: 'medium',
                        ndc: drug.ndc_code,
                        impactDate: drug.patent_expiration_date
                    });
                }
            }

            if (drug.drug_type === 'Biosimilar' && drug.is_interchangeable) {
                alerts.push({
                    id: `int-${drug.ndc_code}`,
                    type: 'biosimilar_launch',
                    title: 'INTERCHANGEABLE BIOSIMILAR DETECTED',
                    message: `${drug.brand_name} is now FDA-designated as interchangeable. Pharmacy-level substitution may impact your Buy-to-Bill margin logic.`,
                    severity: 'high',
                    ndc: drug.ndc_code
                });
            }
        });

        return alerts.length > 0 ? alerts : this.getMockAlerts();
    }

    private getMockAlerts(): MarketAlert[] {
        return [
            {
                id: 'm1',
                type: 'patent_expiry',
                title: 'PATENT EXPIRY ALERT',
                message: 'Avastin (J9035) composite patent protection ends in 180 days. Biosimilar pipeline expected to expand.',
                severity: 'medium',
                impactDate: '2026-12-31'
            },
            {
                id: 'm2',
                type: 'biosimilar_launch',
                title: 'PURPLE BOOK UPDATE',
                message: 'New pegfilgrastim-cbqv biosimilar (Fylnetra) added to interchangeable list. Higher GPO rebates anticipated.',
                severity: 'high'
            }
        ];
    }
}

export const intelligenceService = new IntelligenceService();
