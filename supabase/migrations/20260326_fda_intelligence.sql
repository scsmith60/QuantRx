-- Migration: FDA Intelligence Extensions (Purple & Orange Books)
-- Description: Adds patent, exclusivity, and biosimilar tracking fields to medication_master.
-- Date: 2026-03-26

-- 1. Extend medication_master with FDA Reference Fields
ALTER TABLE public.medication_master 
ADD COLUMN IF NOT EXISTS patent_expiration_date DATE,
ADD COLUMN IF NOT EXISTS exclusivity_expiration_date DATE,
ADD COLUMN IF NOT EXISTS is_interchangeable BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS biosimilar_launch_date DATE,
ADD COLUMN IF NOT EXISTS fda_approval_date DATE;

-- 2. Update existing records with mock FDA data (Oncology focus)
UPDATE public.medication_master SET 
    patent_expiration_date = '2026-12-31', 
    fda_approval_date = '2004-02-26' 
WHERE brand_name = 'Avastin'; -- Bevacizumab Reference

UPDATE public.medication_master SET 
    is_interchangeable = true, 
    biosimilar_launch_date = '2022-04-13' 
WHERE brand_name = 'Alymsys'; -- Bevacizumab Biosimilar

UPDATE public.medication_master SET 
    patent_expiration_date = '2027-06-15',
    fda_approval_date = '2002-01-31'
WHERE brand_name = 'Neulasta'; -- Pegfilgrastim Reference

UPDATE public.medication_master SET 
    is_interchangeable = false,
    biosimilar_launch_date = '2019-11-15'
WHERE brand_name = 'Udenyca'; -- Pegfilgrastim Biosimilar
