

-- 3. Seed Users with CTEs
WITH inserted_users AS (
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, 
        email_confirmed_at, recovery_sent_at, last_sign_in_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
        confirmation_token, email_change, email_change_token_new, recovery_token
    ) 
    SELECT 
        '00000000-0000-0000-0000-000000000000',
        extensions.uuid_generate_v4(),
        'authenticated', 
        'authenticated',
        'user' || (series_val) || '@example.com',
        extensions.crypt('password123', extensions.gen_salt('bf')),
        current_timestamp, current_timestamp, current_timestamp,
        '{"provider":"email","providers":["email"]}', 
        '{}',
        current_timestamp, current_timestamp, 
        '', '', '', ''
    FROM generate_series(1, 10) AS series_val
    RETURNING id, email  -- <--- CRITICAL FIX HERE
),
inserted_identities AS (
    INSERT INTO auth.identities (
        id, user_id, provider_id, identity_data, provider, 
        last_sign_in_at, created_at, updated_at
    )
    SELECT
        extensions.uuid_generate_v4(),
        id,   -- This comes from the CTE above
        id,
        format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
        'email',
        current_timestamp, current_timestamp, current_timestamp
    FROM inserted_users -- <--- CRITICAL FIX: Select from the CTE, not the whole table
    RETURNING user_id   -- <--- CTEs must return data if used in a chain
)
-- 4. Assign Admin Role to user1
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM inserted_users
WHERE email = 'user1@example.com'
ON CONFLICT DO NOTHING;


-- 1. Seed Categories
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Macroeconomics', 'macroeconomics', 'Inflation, GDP, Interest Rates, and Global Economy.'),
  ('Commodities', 'commodities', 'Oil, Gold, Metals, and Agriculture.'),
  ('Equities', 'equities', 'Stock market predictions, Tech stocks, and Market Cap.'),
  ('Crypto', 'crypto', 'Bitcoin, Ethereum, DeFi, and Web3.'),
  ('Fintech', 'fintech', 'Digital Wallets, Payments, and Banking.'),
  ('Manufacturing', 'manufacturing', '3D Printing, Robotics, and Industrial Automation.'),
  ('Logistics', 'logistics', 'Supply Chain, Drones, and Autonomous Transport.'),
  ('Healthcare', 'healthcare', 'Genomics, Biotech, and Telehealth.'),
  ('Society', 'society', 'Demographics, Politics, and Culture.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Seed Gurus (created_by is left NULL for now)
INSERT INTO public.gurus (id, name, slug, bio, twitter_handle)
VALUES 
  (gen_random_uuid(), 'Cathie Wood', 'cathie-wood', 'Founder and CEO of ARK Invest. Known for disruptive innovation theories.', 'CathieDWood'),
  (gen_random_uuid(), 'Naval Ravikant', 'naval', 'Co-founder of AngelList and philosopher of wealth.', 'naval'),
  (gen_random_uuid(), 'Balaji Srinivasan', 'balajis', 'Former CTO of Coinbase and author of The Network State.', 'balajis');

-- 3. Seed Predictions & Sources
-- P1: Negative CPI
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'macroeconomics'),
    'Negative CPI / Deflation',
    'Predicted inflation would fall below 2% and turn negative (deflation) due to tech productivity and demand destruction.',
    'incorrect',
    '2024-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://www.youtube.com/shorts/5paZQBfBsT8', 'primary' FROM p;

-- P2: Crude Oil to $12
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'commodities'),
    'Crude Oil to $12',
    'Forecasted oil prices would crash to $12/barrel as EV adoption destroyed demand.',
    'incorrect',
    '2025-12-31', 
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://markets.businessinsider.com/news/commodities/cathie-wood-12-dollar-oil-price-per-barrel-outlook-crash-2022-3', 'secondary' FROM p;

-- P3: Tesla to $4,000 (Correct)
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'equities'),
    'Tesla to $4,000 (Split-Adj)',
    'Predicted Tesla stock would hit $4,000 (pre-split) within 5 years.',
    'correct',
    '2023-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://markets.businessinsider.com/news/stocks/tesla-stock-analysis-cathie-wood-ark-prediction-just-came-true-2021-1-1029944356', 'secondary' FROM p;

-- P4: Tesla to $3,000 (Incorrect/Missed)
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'equities'),
    'Tesla to $3,000 (2025 Target)',
    'Base case target of $3,000 (pre-split) or ~$1,000 (post-split) by 2025.',
    'incorrect', 
    '2025-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://financhill.com/blog/investing/cathie-wood-tesla-prediction', 'secondary' FROM p;

-- P5: Tesla to $2,600 (Pending/In Progress)
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'equities'),
    'Tesla to $2,600 (2029 Target)',
    'Updated target of $2,600 by 2029, relying on 90% of value from Robotaxis.',
    'pending', 
    '2029-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://www.ark-invest.com/articles/valuation-models/arks-tesla-price-target-2029', 'primary' FROM p;

-- P6: Zoom to $1,500
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'equities'),
    'Zoom to $1,500',
    'Predicted Zoom (ZM) would hit $1,500/share by 2026 as an AI-productivity suite.',
    'incorrect',
    '2026-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://www.ark-invest.com/articles/valuation-models/arks-zoom-model', 'primary' FROM p;

-- P7: Bitcoin to $1 Million
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'crypto'),
    'Bitcoin to $1 Million',
    'Base case target of $1M per Bitcoin by 2030 (revised to $1.2M bull case).',
    'pending',
    '2030-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://seekingalpha.com/news/4435692-cathie-wood-projects-bitcoin-to-soar-to-1_5m-by-2030-according-to-ark-s-bull-case', 'secondary' FROM p;

-- P8: 3D Printing Market
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'manufacturing'),
    '3D Printing Market $180B+',
    'Predicted market size would reach $180B–$490B by 2025.',
    'incorrect',
    '2025-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://research.ark-invest.com/hubfs/1_Download_Files_ARK-Invest/White_Papers/3D_Printing_ARK-Invest-WP.pdf', 'primary' FROM p;

-- P9: Genomics as Next FAANG
WITH p AS (
  INSERT INTO public.predictions (guru_id, category_id, title, description, status, resolution_window_end, prediction_date)
  VALUES (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood'),
    (SELECT id FROM public.categories WHERE slug = 'healthcare'),
    'Genomics as Next FAANG',
    'Predicted Genomics stocks would outperform traditional tech giants.',
    'incorrect',
    '2025-12-31',
    '2020-01-01'
  ) RETURNING id
)
INSERT INTO public.prediction_sources (prediction_id, url, type)
SELECT id, 'https://www.reddit.com/r/stocks/comments/kg5x44/cathie_wood_thinks_that_the_genomics_sector_can/', 'secondary' FROM p;


-- ========================================================
-- SECTION C: THE FIX-UP (Populate created_by)
-- ========================================================

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- 1. Find the generated ID for 'user1@example.com' (our Admin)
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'user1@example.com' 
  LIMIT 1;

  -- 2. Update all Gurus to be created by this admin
  UPDATE public.gurus 
  SET created_by = admin_user_id 
  WHERE created_by IS NULL;

  -- 3. Update all Predictions to be created by this admin
  UPDATE public.predictions 
  SET created_by = admin_user_id 
  WHERE created_by IS NULL;
  
  -- 4. Update Sources (Optional but recommended)
  UPDATE public.prediction_sources
  SET created_by = admin_user_id
  WHERE created_by IS NULL;

END $$;