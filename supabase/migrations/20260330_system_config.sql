-- Migration: Platform Configuration Vault
-- Description: Stores global system parameters (Fees, Thresholds, Security)
-- Date: 2026-03-30

CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Seed Initial Config
INSERT INTO public.platform_config (key, value, description)
VALUES 
    ('global_fee_percent', '15', 'The percentage fee QuantRx charges on the profit lift.'),
    ('yield_threshold_min', '100', 'Minimum dollar amount of lift required to trigger a recommendation.'),
    ('vault_salt_version', '"v1_prod_stable"', 'The current version of the salt used for patient de-identification.'),
    ('ehr_sync_interval_mins', '60', 'How often to poll EHR for new clinical events.')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Policies: Only SUPER_ADMIN can modify, everyone can read (for calculations)
DROP POLICY IF EXISTS "Anyone can read platform config" ON public.platform_config;
CREATE POLICY "Anyone can read platform config" 
ON public.platform_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Super Admins can modify platform config" ON public.platform_config;
CREATE POLICY "Only Super Admins can modify platform config" 
ON public.platform_config FOR ALL USING (

    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
);
