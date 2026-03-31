-- Migration: Practice Onboarding & Provisioning
-- Description: Handles lead capture and automated practice provisioning for Super Admins.
-- Date: 2026-03-30

-- 1. Table for Lead Capture
CREATE TABLE IF NOT EXISTS public.onboarding_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practice_name TEXT NOT NULL,
    npi_number TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.onboarding_leads ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone can insert a lead (Request Access form)
DROP POLICY IF EXISTS "Anyone can submit an onboarding lead" ON public.onboarding_leads;
CREATE POLICY "Anyone can submit an onboarding lead" ON public.onboarding_leads FOR INSERT WITH CHECK (true);

-- Only Super Admins can see/update leads
DROP POLICY IF EXISTS "Only Super Admins can manage onboarding leads" ON public.onboarding_leads;
CREATE POLICY "Only Super Admins can manage onboarding leads" 
ON public.onboarding_leads FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
);

-- 4. Automated Provisioning Function (The "Approval" Button)
CREATE OR REPLACE FUNCTION public.approve_practice(lead_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_lead RECORD;
    v_org_id UUID;
BEGIN
    -- 1. Fetch the lead
    SELECT * INTO v_lead FROM public.onboarding_leads WHERE id = lead_id AND status = 'PENDING';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Lead not found or already processed');
    END IF;

    -- 2. Create the Organization
    INSERT INTO public.organizations (name, type)
    VALUES (v_lead.practice_name, 'PRACTICE')
    RETURNING id INTO v_org_id;

    -- 3. Initialize Practice Config
    INSERT INTO public.practice_config (organization_id, npi_number)
    VALUES (v_org_id, v_lead.npi_number);

    -- 4. Check if the user already exists in auth.users and link them
    -- We search user_profiles by email (if we have that mapping elsewhere) or 
    -- we can try to find an auth.user with that email.
    -- For simplicity in this migration, we'll try to update any profile that matches the email.
    UPDATE public.user_profiles 
    SET organization_id = v_org_id, 
        role = 'OFFICE_ADMIN',
        full_name = v_lead.full_name
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = v_lead.admin_email
    );

    -- 5. Mark lead as APPROVED
    UPDATE public.onboarding_leads 
    SET status = 'APPROVED', updated_at = NOW()
    WHERE id = lead_id;

    RETURN jsonb_build_object('success', true, 'org_id', v_org_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Public Status Check (For Registration Validation)
CREATE OR REPLACE FUNCTION public.check_lead_status(p_email TEXT)
RETURNS TEXT AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT status INTO v_status FROM public.onboarding_leads WHERE admin_email = p_email LIMIT 1;
    RETURN COALESCE(v_status, 'NOT_FOUND');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
