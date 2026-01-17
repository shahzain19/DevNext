-- ===============================
-- 🚀 UPDATE PROFILES & SEED REAL DATA
-- ===============================

-- 1. ADD MISSING COLUMNS TO PROFILES
-- ===============================

-- Create types if they don't exist
do $$ begin
    create type verification_status as enum ('pending', 'approved', 'rejected');
exception
    when duplicate_object then null;
end $$;

-- Add columns
alter table profiles 
add column if not exists bio text,
add column if not exists location text,
add column if not exists skills text[] default '{}',
add column if not exists verification verification_status default 'pending',
add column if not exists hourly_rate int,
add column if not exists github_url text,
add column if not exists portfolio_url text,
add column if not exists availability boolean default true;

-- 2. SEED REAL DATA (Using upsert to avoid conflicts)
-- ===============================

-- Clean up existing data for these test users if re-running
-- (We use the same IDs to make it idempotent)

-- 👨‍💻 BUILDER 1: Alex Chen (React Expert)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'alex.chen@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Alex Chen"}'
) on conflict (id) do nothing;

insert into public.profiles (id, email, name, role, bio, location, skills, hourly_rate, verification, avatar_url)
values (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'alex.chen@example.com',
  'Alex Chen',
  'builder',
  'Senior Frontend Engineer specializing in React and Next.js. 5+ years of experience building scalable web applications for startups and enterprise clients.',
  'San Francisco, CA',
  ARRAY['React', 'Next.js', 'dominating', 'TypeScript', 'TailwindCSS'],
  120,
  'approved',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
) on conflict (id) do update 
set role = 'builder', verification = 'approved', skills = ARRAY['React', 'Next.js', 'Typescript', 'TailwindCSS'], hourly_rate = 120;

-- 👩‍💻 BUILDER 2: Sarah Miller (Full Stack)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'sarah.miller@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Sarah Miller"}'
) on conflict (id) do nothing;

insert into public.profiles (id, email, name, role, bio, location, skills, hourly_rate, verification, avatar_url)
values (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'sarah.miller@example.com',
  'Sarah Miller',
  'builder',
  'Full Stack Developer with a passion for clean code and user experience. Experienced in Node.js, Python, and React Native.',
  'New York, NY',
  ARRAY['Node.js', 'Python', 'React Native', 'PostgreSQL', 'AWS'],
  95,
  'approved',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
) on conflict (id) do update 
set role = 'builder', verification = 'approved';

-- 👨‍💻 BUILDER 3: James Wilson (Backend Pro)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'james.wilson@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"James Wilson"}'
) on conflict (id) do nothing;

insert into public.profiles (id, email, name, role, bio, location, skills, hourly_rate, verification, avatar_url)
values (
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'james.wilson@example.com',
  'James Wilson',
  'builder',
  'Backend Architect focused on system design and high-performance APIs. Go and Rust enthusiast.',
  'Austin, TX',
  ARRAY['Go', 'Rust', 'Docker', 'Kubernetes', 'Redis'],
  140,
  'approved',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
) on conflict (id) do update 
set role = 'builder', verification = 'approved';

-- 💼 CLIENT 1: TechStart Inc.
insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
values (
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'founder@techstart.io',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"TechStart Inc."}'
) on conflict (id) do nothing;

insert into public.profiles (id, email, name, role, bio, location, avatar_url)
values (
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'founder@techstart.io',
  'TechStart Inc.',
  'client',
  'YCombinator backed startup building the future of AI.',
  'San Francisco, CA',
  'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=400&h=400&fit=crop'
) on conflict (id) do update set role = 'client';


-- 3. SEED PROJECTS
-- ===============================

insert into public.projects (id, client_id, title, description, budget_min, budget_max, stack, status)
values 
(
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', -- Client ID
  'E-commerce Platform Migration',
  'We need to migrate our existing Shopify store to a custom Next.js solution. Looking for an expert who can handle complex data migration and build a high-converting storefront.',
  5000,
  10000,
  ARRAY['Next.js', 'Shopify', 'PostgreSQL', 'Stripe'],
  'open'
),
(
  'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', -- Client ID
  'AI-Powered MVP Development',
  'Building an MVP for an AI text generation tool. Need a full-stack developer who understands LLM integration (OpenAI API).',
  8000,
  15000,
  ARRAY['Python', 'FastAPI', 'React', 'OpenAI'],
  'open'
)
on conflict (id) do nothing;

-- Ensure indexes exist for the new columns
create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_verification_idx on profiles(verification);
create index if not exists profiles_skills_gin on profiles using gin(skills);

