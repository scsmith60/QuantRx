-- QuantRx Master Schema (Phase 1: Triple Latch Foundation)

-- 1. Public Medication Master (Reference data)
create table if not exists public.medication_master (
    id uuid primary key default uuid_generate_v4(),
    ndc_code text unique not null,
    hcpcs_code text not null,
    brand_name text not null,
    drug_type text check (drug_type in ('Brand', 'Generic', 'Biosimilar')),
    reimbursement_logic text check (reimbursement_logic in ('ASP+6', 'ASP+8', 'MAC-Spread')),
    specialty text check (specialty in ('Oncology', 'Rheumatology', 'Gastroenterology')),
    route text check (route in ('IV', 'Oral', 'SubQ')),
    created_at timestamp with time zone default now()
);

-- 2. Vault Contracts (Practice-specific Rebates & Wholesaler Pricing)
create schema if not exists quant_vault;

create table if not exists quant_vault.contracts (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references auth.users(id),
    ndc_code text not null references public.medication_master(ndc_code),
    wholesaler_invoice_price decimal(12, 2) not null,
    gpo_rebate_percentage decimal(5, 2) default 0.00,
    mfg_rebate_amount decimal(12, 2) default 0.00,
    effective_date date default current_date
);

-- 3. Vault Attribution (Switch monitoring matched to Remittance)
create table if not exists quant_vault.attribution (
    id uuid primary key default uuid_generate_v4(),
    practice_id uuid not null references auth.users(id),
    patient_id text not null,
    switch_event_id uuid, -- Link to front-end switch log
    ndc_ordered text references public.medication_master(ndc_code),
    ndc_recommended text references public.medication_master(ndc_code),
    remittance_payout_amount decimal(12, 2),
    remittance_check_date date,
    net_profit_recovered decimal(12, 2),
    quant_fee_15_percent decimal(12, 2),
    status text default 'Detected' check (status in ('Detected', 'Matched', 'Invoiced', 'Paid')),
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table quant_vault.contracts enable row level security;
alter table quant_vault.attribution enable row level security;

-- Policies
drop policy if exists "Practices can only view their own contracts" on quant_vault.contracts;
create policy "Practices can only view their own contracts"
on quant_vault.contracts for select using ( auth.uid() = practice_id );

drop policy if exists "Practices can only view their own attribution" on quant_vault.attribution;
create policy "Practices can only view their own attribution"
on quant_vault.attribution for select using ( auth.uid() = practice_id );

-- Seed Master Data
insert into public.medication_master (ndc_code, hcpcs_code, brand_name, drug_type, reimbursement_logic, specialty, route)
values 
    ('00069-0322-01', 'J2506', 'Neulasta', 'Brand', 'ASP+6', 'Oncology', 'SubQ'),
    ('00069-0322-02', 'J1447', 'Armlupeg', 'Biosimilar', 'ASP+8', 'Oncology', 'SubQ'),
    ('00069-0322-03', 'Q5111', 'Udenyca', 'Biosimilar', 'ASP+8', 'Oncology', 'SubQ'),
    ('00069-0322-04', 'J1745', 'Remicade', 'Brand', 'ASP+6', 'Rheumatology', 'IV'),
    ('00069-0322-05', 'Q5103', 'Inflectra', 'Biosimilar', 'ASP+8', 'Rheumatology', 'IV'),
    ('70121-1754-01', 'Q5126', 'Alymsys', 'Biosimilar', 'ASP+8', 'Oncology', 'IV'),
    ('00439-0110-01', 'J9035', 'Avastin', 'Brand', 'ASP+6', 'Oncology', 'IV')
on conflict (ndc_code) do update set brand_name = excluded.brand_name;
