-- Public Schema: NDC lists & CMS ASP rates ($ASP + 8%)
create table if not exists public.medication_pricing (
    hcpcs_code text primary key,
    brand_name text not null,
    ndc_code text,
    asp_rate decimal(12, 2) not null, -- CMS Average Sales Price
    effective_date date default current_date
);

-- quant_vault schema for PHI + Remittance (Protected by RLS)
create schema if not exists quant_vault;

create table if not exists quant_vault.patient_phi (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references auth.users(id),
    fhir_patient_id text not null,
    full_name text not null,
    dob date,
    insurance_provider text,
    created_at timestamp with time zone default now()
);

create table if not exists quant_vault.remittance_data (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references auth.users(id),
    claim_id text not null,
    patient_id uuid references quant_vault.patient_phi(id),
    hcpcs_code text not null,
    amount_paid decimal(12, 2) not null,
    payment_status text,
    raw_835_data jsonb, -- The original EDI 835 fragment
    created_at timestamp with time zone default now()
);

-- Enable RLS for everything in quant_vault
alter table quant_vault.patient_phi enable row level security;
alter table quant_vault.remittance_data enable row level security;

drop policy if exists "Practices can only view their own PHI" on quant_vault.patient_phi;
create policy "Practices can only view their own PHI"
on quant_vault.patient_phi for select using ( auth.uid() = practice_id );

drop policy if exists "Practices can only view their own Remittance" on quant_vault.remittance_data;
create policy "Practices can only view their own Remittance"
on quant_vault.remittance_data for select using ( auth.uid() = practice_id );

-- Seed Data (Synthetic 2026 rates)
insert into public.medication_pricing (hcpcs_code, brand_name, asp_rate)
values 
    ('J2506', 'Neulasta', 3245.00),
    ('ARML', 'Armlupeg', 1150.00),
    ('UDEN', 'Udenyca', 1210.00)
on conflict (hcpcs_code) do update set asp_rate = excluded.asp_rate;

-- Table: quant_billing
-- (Existing table, updated with references if needed)
create table if not exists public.quant_billing (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references auth.users(id),
    patient_id text not null,
    hcpcs_switched_from text not null,
    hcpcs_switched_to text not null,
    net_lift_amount decimal(12, 2) not null,
    quant_fee_15_percent decimal(12, 2) not null,
    status text not null default 'Unbilled' check (status in ('Unbilled', 'Invoiced', 'Paid')),
    created_at timestamp with time zone default now()
);

-- (Rest of RLS policies as before)
alter table public.quant_billing enable row level security;

drop policy if exists "Practices can only view their own billing data" on public.quant_billing;
create policy "Practices can only view their own billing data" on public.quant_billing for select using ( auth.uid() = practice_id );

drop policy if exists "Practices can insert their own billing records" on public.quant_billing;
create policy "Practices can insert their own billing records" on public.quant_billing for insert with check ( auth.uid() = practice_id );
