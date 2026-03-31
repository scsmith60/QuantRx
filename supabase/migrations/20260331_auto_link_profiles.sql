-- Migration: Auto-Linking Onboarding Profiles
-- Description: Automatically creates a public profile and links to an organization when an approved lead signs up.
-- Date: 2026-03-31

-- 1. Function to handle the auto-linking
CREATE OR REPLACE FUNCTION public.handle_new_user_provisioning()
RETURNS TRIGGER AS $$
DECLARE
    v_org_id UUID;
    v_full_name TEXT;
    v_lead_id UUID;
BEGIN
    -- Search for an APPROVED lead matching the new user's email
    SELECT id, organization_id, full_name 
    INTO v_lead_id, v_org_id, v_full_name
    FROM public.onboarding_leads
    WHERE admin_email = NEW.email AND status = 'APPROVED'
    LIMIT 1;

    -- If an approved lead is found, provision their profile
    IF v_org_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (id, organization_id, role, full_name)
        VALUES (NEW.id, v_org_id, 'OFFICE_ADMIN', v_full_name);
        
        -- Optional: We could also log the "Claimed" status back to the lead
        -- UPDATE public.onboarding_leads SET updated_at = NOW() WHERE id = v_lead_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on auth.users (handled via Supabase)
-- Note: In a real Supabase environment, this is usually applied to the `auth.users` table.
-- For local development, we ensure the trigger exists on the table.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_provisioning();
