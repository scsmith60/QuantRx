-- Migration: Standardized Multi-tenancy (Security Audit)
-- Description: Ensures all practices are strictly isolated via Row Level Security (RLS)
-- Date: 2026-03-30

-- 1. Ensure RLS is enabled on all sensitive tables
ALTER TABLE quant_vault.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quant_vault.attribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE quant_vault.managed_therapies ENABLE ROW LEVEL SECURITY;
ALTER TABLE quant_vault.remittance_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE quant_vault.patient_phi ENABLE ROW LEVEL SECURITY;

-- 2. Audit & Standardize Policies (Practice Isolation)

-- Contracts
DROP POLICY IF EXISTS "Practices can only view their own contracts" ON quant_vault.contracts;
CREATE POLICY "Practices can only view their own contracts"
ON quant_vault.contracts FOR ALL USING ( auth.uid() = practice_id );

-- Attribution (Triple Latch)
DROP POLICY IF EXISTS "Practices can only view their own attribution" ON quant_vault.attribution;
CREATE POLICY "Practices can only view their own attribution"
ON quant_vault.attribution FOR ALL USING ( auth.uid() = practice_id );

-- Managed Therapies (Recurring Yield)
DROP POLICY IF EXISTS "Practices can only view their own managed therapies" ON quant_vault.managed_therapies;
CREATE POLICY "Practices can only view their own managed therapies"
ON quant_vault.managed_therapies FOR ALL USING ( auth.uid() = practice_id );

-- Remittance
DROP POLICY IF EXISTS "Practices can only view their own remittance" ON quant_vault.remittance_data;
CREATE POLICY "Practices can only view their own remittance"
ON quant_vault.remittance_data FOR ALL USING ( auth.uid() = practice_id );

-- Patient PHI
DROP POLICY IF EXISTS "Practices can only view their own PHI" ON quant_vault.patient_phi;
CREATE POLICY "Practices can only view their own PHI"
ON quant_vault.patient_phi FOR ALL USING ( auth.uid() = practice_id );

-- 3. Super Admin Universal View (For the Admin Console)
-- Note: Super Admins can see EVERYTHING to generate global reports.
CREATE POLICY "Super Admins can see everything in the vault"
ON quant_vault.attribution FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
);

CREATE POLICY "Super Admins can see everything in managed therapies"
ON quant_vault.managed_therapies FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
);
