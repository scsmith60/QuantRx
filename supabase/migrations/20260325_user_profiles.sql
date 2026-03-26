-- Migration: Multi-Tenant Foundation
-- Description: Organizations and User Profiles for RLS segregation.
-- Date: 2026-03-25

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PRACTICE', 'PLATFORM')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create User Profiles Table (Bridges Auth.Users to Orgs/Roles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id),
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'OFFICE_ADMIN', 'OFFICE_STAFF')),
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Safe Role Check Function (Bypasses RLS to prevent recursion)
CREATE OR REPLACE FUNCTION public.check_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Final RLS Policies (Clean & Non-Recursive)
-- Users can read their own organization info
CREATE POLICY "Users can view their own organization"
    ON public.organizations
    FOR SELECT
    TO authenticated
    USING (id IN (SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()));

-- Users can read their own profile
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- SuperAdmins (QuantRx) can see everything
CREATE POLICY "SuperAdmins have full access to organizations"
    ON public.organizations
    FOR ALL
    TO authenticated
    USING (public.check_is_super_admin());

CREATE POLICY "SuperAdmins have full access to profiles"
    ON public.user_profiles
    FOR ALL
    TO authenticated
    USING (public.check_is_super_admin());

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
