-- Migration: Part D (Oral) Medication & Pricing
-- Description: Adds Part D drugs and pricing logic for Generic/MAC optimization.
-- Date: 2026-03-26

-- 1. Seed Part D Medication Master
INSERT INTO public.medication_master (ndc_code, hcpcs_code, brand_name, drug_type, reimbursement_logic, specialty, route)
VALUES 
    ('00069-0231-01', 'ORAL', 'Xeljanz (Brand)', 'Brand', 'MAC-Spread', 'Rheumatology', 'Oral'),
    ('00069-0231-02', 'ORAL', 'Tofacitinib (Generic)', 'Generic', 'MAC-Spread', 'Rheumatology', 'Oral'),
    ('00172-2081-01', 'ORAL', 'Apotex Generic', 'Generic', 'MAC-Spread', 'Rheumatology', 'Oral')
ON CONFLICT (ndc_code) DO UPDATE SET drug_type = EXCLUDED.drug_type;

-- 2. Add Pricing specific to Part D (MAC vs Wholesaler)
-- We'll use the existing contracts table but expand the logic in code
INSERT INTO quant_vault.contracts (practice_id, ndc_code, wholesaler_invoice_price, gpo_rebate_percentage, mfg_rebate_amount)
SELECT 
    practice_id,
    '00069-0231-01', -- Xeljanz Brand
    1250.00,
    0.00,
    0.00
FROM quant_vault.contracts LIMIT 1;

INSERT INTO quant_vault.contracts (practice_id, ndc_code, wholesaler_invoice_price, gpo_rebate_percentage, mfg_rebate_amount)
SELECT 
    practice_id,
    '00069-0231-02', -- Tofacitinib Generic
    450.00,
    5.00,
    0.00
FROM quant_vault.contracts LIMIT 1;

-- Seed a Mock MAC Table for Part D
CREATE TABLE IF NOT EXISTS public.payer_mac_rates (
    id uuid primary key default uuid_generate_v4(),
    ndc_code text references public.medication_master(ndc_code),
    payer_name text not null,
    mac_rate decimal(12, 2) not null,
    effective_date date default current_date
);

INSERT INTO public.payer_mac_rates (ndc_code, payer_name, mac_rate)
VALUES 
    ('00069-0231-01', 'Aetna PPO', 1400.00),
    ('00069-0231-02', 'Aetna PPO', 850.00)
ON CONFLICT DO NOTHING;
