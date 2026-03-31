-- Infrastructure Consolidation & HIPAA Isolation Sync
-- Moves vault tables to public schema and secures them with RLS

-- 1. Ensure practice_config exists in public
CREATE TABLE IF NOT EXISTS public.practice_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.onboarding_leads(organization_id),
    npi_number TEXT,
    ehr_system TEXT,
    specialty_focus TEXT,
    is_setup_complete BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create contracts table in public (replacing quant_vault.contracts)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.onboarding_leads(organization_id),
    ndc_code TEXT NOT NULL,
    wholesaler_invoice_price DECIMAL(12,2),
    gpo_rebate_percentage DECIMAL(5,2),
    mfg_rebate_amount DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create attribution table in public (replacing quant_vault.attribution)
CREATE TABLE IF NOT EXISTS public.attribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.onboarding_leads(organization_id),
    patient_id TEXT,
    ndc_ordered TEXT,
    ndc_recommended TEXT,
    net_profit_recovered DECIMAL(12,2),
    quant_fee_collected DECIMAL(12,2),
    status TEXT DEFAULT 'Detected',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS on all practice-facing tables
ALTER TABLE public.practice_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution ENABLE ROW LEVEL SECURITY;

-- 5. Create the "Practice Gate" Policies (Isolation)
-- Policy: Only allow access if the user's profile organization_id matches the row's organization_id

-- Practice Config Policy
CREATE POLICY "Practice Isolation: Config" ON public.practice_config
FOR ALL TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Contracts Policy
CREATE POLICY "Practice Isolation: Contracts" ON public.contracts
FOR SELECT TO authenticated
USING (
    organization_id IS NULL OR -- Allow shared/global contracts (optional)
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- Attribution Policy
CREATE POLICY "Practice Isolation: Attribution" ON public.attribution
FOR ALL TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
);

-- 6. Link pre-existing leads to their config if missing
INSERT INTO public.practice_config (organization_id, is_setup_complete)
SELECT organization_id, false 
FROM public.onboarding_leads 
WHERE organization_id IS NOT NULL
ON CONFLICT DO NOTHING;
