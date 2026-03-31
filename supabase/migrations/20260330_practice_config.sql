-- Migration: Practice Configuration Vault
-- Description: Stores practice-specific settings (NPI, EHR, Specialty)
-- Date: 2026-03-30

CREATE TABLE IF NOT EXISTS public.practice_config (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id),
    npi_number TEXT UNIQUE,
    ehr_system TEXT CHECK (ehr_system IN ('EPIC', 'CERNER', 'ATHENA', 'OTHER')),
    specialty_focus TEXT CHECK (specialty_focus IN ('ONCOLOGY', 'RHEUMATOLOGY', 'UROLOGY')),
    is_setup_complete BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.practice_config ENABLE ROW LEVEL SECURITY;

-- Policies: Admins can manage their own org config
DROP POLICY IF EXISTS "Users can read their own practice config" ON public.practice_config;
CREATE POLICY "Users can read their own practice config" 
ON public.practice_config FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.organization_id = practice_config.organization_id 
        AND user_profiles.id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Office Admins can update their own practice config" ON public.practice_config;
CREATE POLICY "Office Admins can update their own practice config" 
ON public.practice_config FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.organization_id = practice_config.organization_id 
        AND user_profiles.id = auth.uid()
        AND user_profiles.role IN ('OFFICE_ADMIN', 'SUPER_ADMIN')
    )
);
