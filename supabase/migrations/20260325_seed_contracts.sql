-- Seed Practice Vault Contracts for Demo
-- Providing realistic wholesaler pricing for Biosimilars to trigger 'Switch' logic

insert into quant_vault.contracts (practice_id, ndc_code, wholesaler_invoice_price, gpo_rebate_percentage, mfg_rebate_amount)
select 
    id as practice_id,
    '70121-1754-01' as ndc_code,
    842.00 as wholesaler_invoice_price,
    2.00 as gpo_rebate_percentage,
    50.00 as mfg_rebate_amount
from auth.users
limit 1;

insert into quant_vault.contracts (practice_id, ndc_code, wholesaler_invoice_price, gpo_rebate_percentage, mfg_rebate_amount)
select 
    id as practice_id,
    '00069-0322-02' as ndc_code,
    2400.00 as wholesaler_invoice_price,
    1.50 as gpo_rebate_percentage,
    100.00 as mfg_rebate_amount
from auth.users
limit 1;

insert into quant_vault.contracts (practice_id, ndc_code, wholesaler_invoice_price, gpo_rebate_percentage, mfg_rebate_amount)
select 
    id as practice_id,
    '00069-0322-05' as ndc_code,
    1500.00 as wholesaler_invoice_price,
    3.00 as gpo_rebate_percentage,
    75.00 as mfg_rebate_amount
from auth.users
limit 1;
