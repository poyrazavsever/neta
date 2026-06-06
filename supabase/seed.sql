-- Seed Data for Local Development
-- This file populates the database with demo data when running `supabase start` or `supabase db reset`.

-- 1. Create a dummy user
-- Password for this user: "demo123456"
-- Wait! Direct insert into auth.users is complex due to password hashing.
-- For local development, it's easier to sign up via the UI first.
-- However, we can create a function that populates demo data for a specific user ID, or we can insert an auth user with a pre-calculated crypt hash.
-- Using a standard bcrypt hash for 'demo123456': $2a$10$wT0/487K12z0fB4n0p.PMeI5b1aH03T1gB8Kj1k1k1k1k1k1k1k1k

INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'demo@cognis.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now(),
    'authenticated',
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    format('{"sub": "%s", "email": "demo@cognis.com"}', '00000000-0000-0000-0000-000000000000')::jsonb,
    'email',
    now(),
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Profile for Demo User
INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Demo',
    'User',
    ''
) ON CONFLICT (id) DO NOTHING;

-- App Settings for Demo User
INSERT INTO public.app_settings (user_id, ai_provider, api_key)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'ollama',
    ''
) ON CONFLICT (user_id) DO NOTHING;

-- Seed Projects
INSERT INTO public.projects (id, user_id, name, type, status, description, progress)
VALUES 
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'E-Ticaret Yeniden Tasarımı', 'client_project', 'active', 'Ana sayfa ve ödeme adımlarının yenilenmesi.', 40),
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'Cognis MVP Geliştirme', 'side_project', 'active', 'Freelancer işletim sistemi geliştirme süreci.', 85)
ON CONFLICT (id) DO NOTHING;

-- Seed Tasks
INSERT INTO public.tasks (id, user_id, title, status, project_id, created_at, due_at)
VALUES 
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Ana Sayfa Tasarımı (Wireframe)', 'completed', '11111111-1111-1111-1111-111111111111', now() - interval '5 days', now() - interval '2 days'),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Ödeme Adımı Entegrasyonu', 'in_progress', '11111111-1111-1111-1111-111111111111', now() - interval '2 days', now() + interval '3 days'),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'Dashboard UI Güncellemesi', 'todo', '22222222-2222-2222-2222-222222222222', now() - interval '1 day', now() + interval '5 days')
ON CONFLICT DO NOTHING;

-- Seed Finances
INSERT INTO public.finance_transactions (id, user_id, type, amount, category, project_id, transaction_date)
VALUES 
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'income', 15000.00, 'Proje Avansı', '11111111-1111-1111-1111-111111111111', now() - interval '10 days'),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'expense', 450.00, 'Yazılım Abonelikleri', NULL, now() - interval '5 days'),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'expense', 120.00, 'Kahve / Yemek', NULL, now() - interval '1 day')
ON CONFLICT DO NOTHING;

-- Seed Daily Logs
INSERT INTO public.daily_logs (id, user_id, log_date, mood_score, energy_score, notes)
VALUES 
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', current_date - interval '2 days', 4, 3, 'Biraz yorgun ama verimli geçti.'),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', current_date - interval '1 day', 5, 5, 'Harika odaklandım, projenin %80 ini bitirdim.'),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', current_date, 3, 2, 'Biraz uykusuzum.')
ON CONFLICT DO NOTHING;
