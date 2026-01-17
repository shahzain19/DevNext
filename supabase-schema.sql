-- ===============================
-- 🧨 NUKE EVERYTHING (Clean Slate)
-- ===============================
-- WARNING: This will DELETE all data! Only run if you want to start fresh.

-- Drop all policies first
drop policy if exists "public_profiles_read" on profiles;
drop policy if exists "self_profile_read" on profiles;
drop policy if exists "self_profile_update" on profiles;
drop policy if exists "admin_profile_full_access" on profiles;
drop policy if exists "projects_read" on projects;
drop policy if exists "clients_create_projects" on projects;
drop policy if exists "client_update_project" on projects;
drop policy if exists "builder_apply" on applications;
drop policy if exists "builder_view_apps" on applications;
drop policy if exists "client_view_apps" on applications;
drop policy if exists "project_message_read" on messages;
drop policy if exists "send_message" on messages;
drop policy if exists "public avatars" on storage.objects;
drop policy if exists "upload avatar" on storage.objects;
drop policy if exists "portfolio owner access" on storage.objects;

-- Drop triggers
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_updated_at on profiles;

-- Drop functions
drop function if exists public.handle_new_user();
drop function if exists public.set_updated_at();
drop function if exists match_builders(uuid);

-- Drop tables (in reverse order of dependencies)
drop table if exists public.reviews cascade;
drop table if exists public.messages cascade;
drop table if exists public.applications cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

-- Drop enums
drop type if exists verification_status;
drop type if exists project_status;
drop type if exists user_role;

-- ===============================
-- 🔹 EXTENSIONS
-- ===============================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ===============================
-- 🔹 ENUMS
-- ===============================
create type user_role as enum ('builder', 'client', 'admin');
create type project_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type verification_status as enum ('pending', 'approved', 'rejected');

-- ===============================
-- 👤 PROFILES
-- ===============================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  name text not null,
  avatar_url text,
  bio text,
  location text,
  skills text[] default '{}',
  github_url text,
  portfolio_url text,
  verification verification_status default 'pending',
  hourly_rate int,
  availability boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index profiles_role_idx on profiles(role);
create index profiles_skills_gin on profiles using gin(skills);
create index profiles_verification_idx on profiles(verification);

-- ===============================
-- 📦 PROJECTS
-- ===============================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  budget_min int not null,
  budget_max int not null,
  stack text[] default '{}',
  status project_status default 'open',
  created_at timestamptz default now()
);

-- Indexes
create index projects_client_idx on projects(client_id);
create index projects_stack_gin on projects using gin(stack);
create index projects_status_idx on projects(status);

-- ===============================
-- 🤝 PROJECT APPLICATIONS
-- ===============================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  builder_id uuid references profiles(id) on delete cascade,
  cover_letter text,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(project_id, builder_id)
);

-- Indexes
create index applications_project_idx on applications(project_id);
create index applications_builder_idx on applications(builder_id);

-- ===============================
-- 💬 MESSAGES
-- ===============================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Indexes (chat speed)
create index messages_project_time_idx 
on messages(project_id, created_at desc);

-- ===============================
-- ⭐ REVIEWS (Future-proof)
-- ===============================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  reviewer_id uuid references profiles(id),
  reviewee_id uuid references profiles(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- ===============================
-- ⚙️ UPDATED_AT TRIGGER
-- ===============================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
before update on profiles
for each row execute procedure set_updated_at();

-- ===============================
-- 🔐 SECURITY (RLS)
-- ===============================
alter table profiles enable row level security;
alter table projects enable row level security;
alter table applications enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;

-- 👤 PROFILES POLICIES
-- Anyone can read verified profiles
create policy "public_profiles_read"
on profiles for select
using (verification = 'approved');

-- User can read own profile
create policy "self_profile_read"
on profiles for select
using (auth.uid() = id);

-- User can update own profile
create policy "self_profile_update"
on profiles for update
using (auth.uid() = id);

-- Admin can update anything
create policy "admin_profile_full_access"
on profiles for all
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

-- 📦 PROJECTS POLICIES
-- Anyone logged in can view open projects
create policy "projects_read"
on projects for select
using (auth.role() = 'authenticated');

-- Only clients create projects
create policy "clients_create_projects"
on projects for insert
with check (
  auth.uid() = client_id
);

-- Client can update own project
create policy "client_update_project"
on projects for update
using (auth.uid() = client_id);

-- 🤝 APPLICATIONS POLICIES
-- Builder can apply
create policy "builder_apply"
on applications for insert
with check (auth.uid() = builder_id);

-- Builder can view own applications
create policy "builder_view_apps"
on applications for select
using (auth.uid() = builder_id);

-- Client can view applications to their project
create policy "client_view_apps"
on applications for select
using (
  exists (
    select 1 from projects p
    where p.id = project_id
    and p.client_id = auth.uid()
  )
);

-- 💬 MESSAGES POLICIES
-- Only project participants can read messages
create policy "project_message_read"
on messages for select
using (
  exists (
    select 1 from projects p
    where p.id = project_id
    and (p.client_id = auth.uid())
  )
  OR sender_id = auth.uid()
);

-- Sender can send message
create policy "send_message"
on messages for insert
with check (auth.uid() = sender_id);

-- ===============================
-- 🧠 MATCHING FUNCTION (V1)
-- ===============================
-- Basic skill overlap matcher
create or replace function match_builders(project uuid)
returns table (
  builder_id uuid,
  skill_overlap int
) as $$
begin
  return query
  select
    p.id,
    cardinality(p.skills && pr.stack) as skill_overlap
  from profiles p
  join projects pr on pr.id = project
  where p.role = 'builder'
    and p.verification = 'approved'
  order by skill_overlap desc;
end;
$$ language plpgsql;

-- ===============================
-- 📂 STORAGE BUCKETS
-- ===============================
-- Run in Supabase dashboard → Storage
-- Create buckets:
-- - avatars        (public)
-- - portfolios     (private)
-- - attachments    (private)

-- Storage Policies (SQL)
-- Public avatars readable
create policy "public avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- User can upload own avatar
create policy "upload avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Portfolio private access
create policy "portfolio owner access"
on storage.objects for all
using (
  bucket_id = 'portfolios'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Folder convention:
-- avatars/{userId}/avatar.png
-- portfolios/{userId}/project1.png

-- ===============================
-- ✅ OPTIONAL: AUTO PROFILE CREATION
-- ===============================
-- Creates profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, name)
  values (new.id, 'client', 'New User');
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();
