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