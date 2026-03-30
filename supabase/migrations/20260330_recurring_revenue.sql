-- Migration: Recurring Revenue (Life of Drug)
-- Description: Adds a table to track clinical enrollments for perpetual yield capture.
-- Date: 2026-03-30

-- 1. Table for tracking managed therapies (The "Enrollment")
CREATE TABLE IF NOT EXISTS quant_vault.managed_therapies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practice_id UUID NOT NULL REFERENCES auth.users(id),
    patient_id_hash TEXT NOT NULL, -- De-identified patient hash
    hcpcs_recommended TEXT NOT NULL,
    baseline_ndc text REFERENCES public.medication_master(ndc_code), -- The NDC being replaced at time of switch
    enrolled_date DATE DEFAULT CURRENT_DATE,
    last_detected_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,

    estimated_annual_lift DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(practice_id, patient_id_hash, hcpcs_recommended)
);

-- 2. Index for fast 835 matching
CREATE INDEX IF NOT EXISTS idx_managed_therapies_match 
ON quant_vault.managed_therapies (practice_id, patient_id_hash, hcpcs_recommended);

-- 3. Enable RLS
ALTER TABLE quant_vault.managed_therapies ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Practices can only view their own managed therapies" ON quant_vault.managed_therapies;
CREATE POLICY "Practices can only view their own managed therapies"
ON quant_vault.managed_therapies FOR SELECT USING ( auth.uid() = practice_id );
