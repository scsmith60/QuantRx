-- 20260325_distributor_pricing.sql
-- Stores acquisition costs ingested from distributor ecommerce CSVs

CREATE TABLE IF NOT EXISTS public.distributor_pricing (
    ndc TEXT PRIMARY KEY,
    product_name TEXT,
    wholesale_price NUMERIC(15, 2) NOT NULL,
    distributor TEXT, -- Cardinal, McKesson, etc.
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (ndc) REFERENCES public.medication_master(ndc_code) ON DELETE CASCADE
);

-- Stores global practice rebate configurations and GPO tiers
CREATE TABLE IF NOT EXISTS public.rebate_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gpo_tier INTEGER DEFAULT 1, -- 1-10
    gpo_rebate_pct NUMERIC(5, 2) DEFAULT 0,
    distributor_rebate_pct NUMERIC(5, 2) DEFAULT 2.00, -- Default 2% for biosimilar focus
    admin_fee_pct NUMERIC(5, 2) DEFAULT 0,
    platform_fee_pct NUMERIC(5, 2) DEFAULT 15.00, -- QuantRx 15% cut
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specific Manufacturer (MFG) Rebate Contracts per NDC/Drug
CREATE TABLE IF NOT EXISTS public.mfg_rebate_contracts (
    ndc TEXT PRIMARY KEY,
    rebate_amount NUMERIC(15, 2) DEFAULT 0,
    is_tiered BOOLEAN DEFAULT FALSE,
    min_volume INTEGER DEFAULT 0,
    FOREIGN KEY (ndc) REFERENCES public.medication_master(ndc_code) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.distributor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rebate_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfg_rebate_contracts ENABLE ROW LEVEL SECURITY;

-- Create Policies for Anon/Authenticated (Practice Level)
CREATE POLICY "Allow all access to distributor_pricing" ON public.distributor_pricing FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to rebate_config" ON public.rebate_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to mfg_rebate_contracts" ON public.mfg_rebate_contracts FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Config
INSERT INTO public.rebate_config (gpo_tier, gpo_rebate_pct, distributor_rebate_pct, platform_fee_pct)
VALUES (3, 5.00, 2.00, 15.00);

-- Insert Mock Biosimilar Distributor Pricing for Alymsys & Avastin
-- These represent the "Buy" prices from ecommerce files
-- Alymsys (70121-1754-01)
INSERT INTO public.distributor_pricing (ndc, product_name, wholesale_price, distributor)
VALUES ('70121-1754-01', 'Alymsys 100mg/4mL', 580.00, 'Cardinal Health')
ON CONFLICT (ndc) DO UPDATE SET wholesale_price = 580.00;

-- Avastin (00439-0110-01)
INSERT INTO public.distributor_pricing (ndc, product_name, wholesale_price, distributor)
VALUES ('00439-0110-01', 'Avastin 100mg/4mL', 2850.00, 'Cardinal Health')
ON CONFLICT (ndc) DO UPDATE SET wholesale_price = 2850.00;
