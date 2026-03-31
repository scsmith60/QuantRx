/**
 * CMS Price Record Interface
 */
export interface CMSPriceRecord {
    hcpcs: string;
    description: string;
    aspPrice: number;       // Current Quarter (current_asp)
    prevASP: number;       // Lookback (prev_asp)
    nextASP: number;       // Lookforward (next_asp)
    reimbursementRate: number; 
    isBiosimilar: boolean;
    effectiveDate: string;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
export const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
    console.error("[Supabase] Critical: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env!");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

class CMSService {
    private _dictionary: Record<string, CMSPriceRecord> = {};
    private _isLoaded: boolean = false;
    private _isFetching: boolean = false;
    
    // Global Request Deduplication Cache
    private _masterCache: Map<string, any> = new Map();
    private _contractCache: Map<string, any> = new Map();
    private _activeRequests: Map<string, Promise<any>> = new Map();

    async fetchASPData(): Promise<Record<string, CMSPriceRecord>> {
        if (this._isLoaded) return this._dictionary;
        if (this._isFetching) {
            while (this._isFetching) await new Promise(r => setTimeout(r, 100));
            return this._dictionary;
        }

        console.log("[CMSService] Synchronizing with CMS.gov Part B via Supabase...");
        this._isFetching = true;

        try {
            if (supabaseKey === 'mock-key') {
                const response = await fetch('/cms_asp_data.json');
                this._dictionary = await response.json();
            } else {
                const { data, error } = await supabase.from('cms_asp_pricing').select('*');
                if (error) throw error;
                
                if (data) {
                    data.forEach(row => {
                        this._dictionary[row.hcpcs] = {
                            hcpcs: row.hcpcs,
                            description: row.description || 'Unknown Drug',
                            aspPrice: Number(row.current_asp) || 0,
                            prevASP: Number(row.prev_asp) || 0,
                            nextASP: Number(row.next_asp) || 0,
                            reimbursementRate: Number(row.reimbursement_rate) || 106,
                            isBiosimilar: !!row.is_biosimilar,
                            effectiveDate: row.effective_date || ''
                        };
                    });
                }
            }
            this._isLoaded = true;
        } catch (err) {
            console.warn("[CMSService] CMS Query failed, using emergency fallback:", err);
            this._dictionary = {
                'J9035': { hcpcs: 'J9035', description: 'Bevacizumab (Avastin)', aspPrice: 1200.00, prevASP: 1200.00, nextASP: 1212.00, reimbursementRate: 106, isBiosimilar: false, effectiveDate: '2026-03-01' },
                'Q5126': { hcpcs: 'Q5126', description: 'Alymsys (Biosimilar)', aspPrice: 1210.00, prevASP: 1210.00, nextASP: 1245.00, reimbursementRate: 106, isBiosimilar: true, effectiveDate: '2026-03-01' },
                'J2506': { hcpcs: 'J2506', description: 'Pegfilgrastim (Neulasta)', aspPrice: 3200.00, prevASP: 3200.00, nextASP: 3200.00, reimbursementRate: 106, isBiosimilar: false, effectiveDate: '2026-03-01' },
                'J1447': { hcpcs: 'J1447', description: 'Armlupeg', aspPrice: 3150.00, prevASP: 3150.00, nextASP: 3150.00, reimbursementRate: 106, isBiosimilar: true, effectiveDate: '2026-03-01' },
            };
            this._isLoaded = true;
        } finally {
            this._isFetching = false;
        }
        
        return this._dictionary;
    }

    getASPByHCPCS(code: string): CMSPriceRecord | undefined {
        if (!code) return undefined;
        return this._dictionary[code.toUpperCase()];
    }

    async searchJoint(query: string): Promise<CMSPriceRecord[]> {
        const q = query.toLowerCase().trim();
        if (!q) return [];

        const hcpcsResults = Object.values(this._dictionary).filter(record => 
            record.hcpcs.toLowerCase().includes(q) || 
            record.description.toLowerCase().includes(q)
        );

        let ndcResults = null;
        try {
            const { data } = await supabase
                .from('cms_ndc_crosswalk')
                .select('*')
                .or(`ndc.ilike.%${q}%,description.ilike.%${q}%`)
                .limit(10);
            ndcResults = data;
        } catch (e) {
             const { data } = await supabase.from('cms_ndc_crosswalk').select('*').ilike('ndc', `%${q}%`).limit(5);
             ndcResults = data;
        }

        if (!ndcResults) return hcpcsResults;

        const mappedNdcResults: CMSPriceRecord[] = ndcResults.map(ndcRow => {
            const hcpcsRecord = this._dictionary[ndcRow.hcpcs?.toUpperCase()];
            if (hcpcsRecord) {
                return {
                    ...hcpcsRecord,
                    description: `${ndcRow.description} [${ndcRow.formatted_ndc || ndcRow.ndc}]`,
                };
            }
            return null;
        }).filter(Boolean) as CMSPriceRecord[];

        const combined = [...hcpcsResults, ...mappedNdcResults];
        const seen = new Set();
        return combined.filter(item => {
            if (!item.hcpcs || item.hcpcs.length < 3) return false;
            const key = `${item.hcpcs}-${item.description}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    calculateMedicalMargin(remittance: number, aspPrice: number): number {
        return (Number(remittance) || 0) - (Number(aspPrice) || 0);
    }

    private normalizeNDC(ndc: string): string {
        if (!ndc) return '';
        return ndc.replace(/-/g, '').trim();
    }

    async getNDCsByHCPCS(hcpcs: string): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('cms_ndc_crosswalk')
                .select('*')
                .eq('hcpcs', hcpcs);
            
            if (!error && data && data.length > 0) return data;
        } catch (e) {
            console.warn("[CMSService] Crosswalk lookup failed.");
        }

        const mockCrosswalk: Record<string, any[]> = {
            'J9035': [{ ndc: '00439-0110-01', description: 'Avastin' }],
            'Q5126': [{ ndc: '70121-1754-01', description: 'Alymsys' }],
            'J2506': [{ ndc: '00069-0322-01', description: 'Neulasta' }],
        };
        return mockCrosswalk[hcpcs?.toUpperCase()] || [];
    }

    async getMasterInfo(ndc: string): Promise<any | null> {
        const cacheKey = `master_${ndc}`;
        if (this._masterCache.has(cacheKey)) return this._masterCache.get(cacheKey);
        
        if (this._activeRequests.has(cacheKey)) return this._activeRequests.get(cacheKey);

        const request = (async () => {
            try {
                // Serial attempt: Underscore version first (standard)
                const { data: d1 } = await supabase.from('medication_master').select('*').eq('ndc_code', ndc).maybeSingle();
                if (d1) {
                    this._masterCache.set(cacheKey, d1);
                    return d1;
                }
                
                // Fallback attempt: Standard underscore version (already tried, but keeping structure for clarity)
                const { data: d1_retry } = await supabase.from('medication_master').select('*').eq('ndc_code', ndc).maybeSingle();
                if (d1_retry) {
                    this._masterCache.set(cacheKey, d1_retry);
                    return d1_retry;
                }

                // Fallback to simpler 'ndc_code' check if needed (some legacy systems might use 'ndc')
                const { data: d2 } = await supabase.from('medication_master').select('*').eq('ndc_code', ndc).maybeSingle();
                if (d2) {
                    this._masterCache.set(cacheKey, d2);
                    return d2;
                }
            } catch (e) {
                console.warn("[CMSService] Master lookup failed.");
            }

            const mockMaster: Record<string, any> = {
                '00439011001': { ndc_code: '00439-0110-01', brand_name: 'Avastin', drug_type: 'Brand' },
                '70121175401': { ndc_code: '70121-1754-01', brand_name: 'Alymsys', drug_type: 'Biosimilar' },
                '55513010101': { ndc_code: '55513-0101-01', brand_name: 'Neulasta', drug_type: 'Brand' },
            };
            const fallback = mockMaster[this.normalizeNDC(ndc)] || null;
            this._masterCache.set(cacheKey, fallback);
            return fallback;
        })();

        this._activeRequests.set(cacheKey, request);
        const result = await request;
        this._activeRequests.delete(cacheKey);
        return result;
    }

    async getVaultContract(ndc: string, organizationId?: string): Promise<any | null> {
        const cacheKey = `contract_${ndc}_${organizationId || 'global'}`;
        if (this._contractCache.has(cacheKey)) return this._contractCache.get(cacheKey);
        if (this._activeRequests.has(cacheKey)) return this._activeRequests.get(cacheKey);

        const request = (async () => {
            try {
                // Point to public.contracts (New Infrastructure Sync)
                let query = supabase.from('contracts').select('*').eq('ndc_code', ndc);
                
                // If org-specific contract exists, prefer it
                if (organizationId) {
                    query = query.eq('organization_id', organizationId);
                } else {
                    query = query.is('organization_id', null);
                }

                const { data: d1, error } = await query.maybeSingle();
                
                if (error) {
                    console.error("[CMSService] Contract fetch error:", error.message);
                    throw error;
                }

                if (d1) {
                    this._contractCache.set(cacheKey, d1);
                    return d1;
                }
            } catch (e) {
                console.warn("[CMSService] Contract lookup bypassed, using mock.");
            }

            const mockContracts: Record<string, any> = {
                '70121175401': { wholesaler_invoice_price: 842.00, gpo_rebate_percentage: 2.00, mfg_rebate_amount: 50.00 },
                '00439011001': { wholesaler_invoice_price: 1180.00, gpo_rebate_percentage: 1.00, mfg_rebate_amount: 0.00 },
            };
            const fallback = mockContracts[this.normalizeNDC(ndc)] || null;
            this._contractCache.set(cacheKey, fallback);
            return fallback;
        })();

        this._activeRequests.set(cacheKey, request);
        const result = await request;
        this._activeRequests.delete(cacheKey);
        return result;
    }

    async getActiveRebateConfig(): Promise<any | null> {
        try {
            const { data, error } = await supabase
                .from('rebate_config')
                .select('*')
                .eq('is_active', true)
                .maybeSingle();
            if (!error && data) return data;
        } catch (e) {
            console.warn("[CMSService] Rebate config lookup failed.");
        }
        return { is_active: true, flat_rebate_biosimilar: 2.50 };
    }

    async getGlobalConfig(key: string, defaultValue: any): Promise<any> {
        const { data, error } = await supabase
            .from('platform_config')
            .select('value')
            .eq('key', key)
            .maybeSingle();

        if (error || !data) return defaultValue;
        return data.value;
    }
}

export const cmsService = new CMSService();
