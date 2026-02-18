-- 1. Seed some initial Gurus for Project Seldon
INSERT INTO public.gurus (id, name, slug, bio, credibility_score, twitter_handle)
VALUES 
  (gen_random_uuid(), 'Naval Ravikant', 'naval', 'Co-founder of AngelList and philosopher of wealth.', 92, 'naval'),
  (gen_random_uuid(), 'Balaji Srinivasan', 'balajis', 'Former CTO of Coinbase and author of The Network State.', 88, 'balajis'),
  (gen_random_uuid(), 'Cathie Wood', 'cathie-wood', 'Founder and CEO of ARK Invest.', 45, 'cathiewood');


  -- 2. Seed Predictions linked to the Gurus above
-- We use subqueries to get the correct guru_id based on the slug
INSERT INTO public.predictions (
  guru_id, 
  title, 
  description, 
  category, 
  status, 
  confidence_level, 
  prediction_date, 
  resolution_date
)
VALUES 
  (
    (SELECT id FROM public.gurus WHERE slug = 'naval' LIMIT 1),
    'AI-driven Personal Tutors',
    'Every child will have a personalized AI tutor that adapts to their learning pace and style.',
    'Technology',
    'pending',
    85,
    '2024-01-01',
    '2030-01-01'
  ),
  (
    (SELECT id FROM public.gurus WHERE slug = 'balajis' LIMIT 1),
    'The Rise of Network States',
    'Physical communities will begin forming based on digital consensus and cryptocurrency governance.',
    'Society',
    'pending',
    70,
    '2023-06-15',
    '2032-01-01'
  ),
  (
    (SELECT id FROM public.gurus WHERE slug = 'cathie-wood' LIMIT 1),
    'EV Dominance',
    'Electric vehicles will constitute over 50% of new car sales globally by 2026.',
    'Economy',
    'pending',
    95,
    '2021-10-10',
    '2026-12-31'
  );

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