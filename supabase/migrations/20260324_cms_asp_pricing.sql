-- Migration: Create CMS ASP Pricing Table
-- Description: Stores multi-quarter CMS Part B ASP pricing data for the Yield Optimization Engine.
-- Date: 2026-03-24

CREATE TABLE IF NOT EXISTS public.cms_asp_pricing (
    hcpcs TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    prev_asp NUMERIC(15, 2) NOT NULL DEFAULT 0,
    current_asp NUMERIC(15, 2) NOT NULL DEFAULT 0,
    next_asp NUMERIC(15, 2) NOT NULL DEFAULT 0,
    reimbursement_rate NUMERIC(15, 2) NOT NULL DEFAULT 0,
    is_biosimilar BOOLEAN NOT NULL DEFAULT false,
    effective_date DATE NOT NULL,
    dosage TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create NDC Crosswalk Table
CREATE TABLE IF NOT EXISTS public.cms_ndc_crosswalk (
    ndc VARCHAR(11),
    hcpcs TEXT,
    conversion_factor NUMERIC(15, 6) DEFAULT 1,
    labeler_name TEXT,
    description TEXT,
    formatted_ndc TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ndc, hcpcs)
);

-- Force all hcpcs columns to TEXT to handle 2026 suffixes
ALTER TABLE public.cms_asp_pricing ALTER COLUMN hcpcs TYPE TEXT;
ALTER TABLE public.cms_ndc_crosswalk ALTER COLUMN hcpcs TYPE TEXT;

-- Ensure formatted_ndc exists for incremental updates
ALTER TABLE public.cms_ndc_crosswalk ADD COLUMN IF NOT EXISTS formatted_ndc TEXT;

-- Backfill: Apply standard 5-4-2 mask to existing 11-digit NDCs that don't have formatting yet
UPDATE public.cms_ndc_crosswalk 
SET formatted_ndc = substr(ndc, 1, 5) || '-' || substr(ndc, 6, 4) || '-' || substr(ndc, 10, 2)
WHERE (formatted_ndc IS NULL OR formatted_ndc = '') AND length(ndc) = 11;

-- Drop old single PK if it exists and add composite PK
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'cms_ndc_crosswalk_pkey' 
        AND contype = 'p'
        AND (SELECT count(*) FROM pg_attribute WHERE attrelid = 'public.cms_ndc_crosswalk'::regclass AND attnum = ANY(conkey)) = 1
    ) THEN
        ALTER TABLE public.cms_ndc_crosswalk DROP CONSTRAINT cms_ndc_crosswalk_pkey;
        ALTER TABLE public.cms_ndc_crosswalk ADD PRIMARY KEY (ndc, hcpcs);
    END IF;
END $$;

-- Remove foreign key constraint (crosswalk contains HCPCS not in pricing file)
ALTER TABLE public.cms_ndc_crosswalk DROP CONSTRAINT IF EXISTS cms_ndc_crosswalk_hcpcs_fkey;

-- 3. Enable RLS
ALTER TABLE public.cms_asp_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_ndc_crosswalk ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Pricing Table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_asp_pricing' AND policyname = 'Allow read access for all') THEN
        CREATE POLICY "Allow read access for all" ON public.cms_asp_pricing FOR SELECT USING (true);
    END IF;
    
    -- Allow authenticated and anon users full access (needed for Admin UI during dev)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_asp_pricing' AND policyname = 'Allow all full access') THEN
        CREATE POLICY "Allow all full access" ON public.cms_asp_pricing FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_asp_pricing' AND policyname = 'Allow service role full access') THEN
        CREATE POLICY "Allow service role full access" ON public.cms_asp_pricing FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 5. RLS Policies for NDC Crosswalk
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_ndc_crosswalk' AND policyname = 'Allow read access for all') THEN
        CREATE POLICY "Allow read access for all" ON public.cms_ndc_crosswalk FOR SELECT USING (true);
    END IF;

    -- Allow authenticated and anon users full access (needed for Admin UI during dev)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_ndc_crosswalk' AND policyname = 'Allow all full access') THEN
        CREATE POLICY "Allow all full access" ON public.cms_ndc_crosswalk FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cms_ndc_crosswalk' AND policyname = 'Allow service role full access') THEN
        CREATE POLICY "Allow service role full access" ON public.cms_ndc_crosswalk FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;


-- Realtime publication for live pricing updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'cms_asp_pricing'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_asp_pricing;
    END IF;
END $$;
