-- ===============================
-- 🧨 NUKE EVERYTHING (Clean Slate)
-- ===============================
-- This section deletes ALL existing policies that are causing the infinite loop
drop policy if exists "public_profiles_read" on profiles;
drop policy if exists "self_profile_read" on profiles;
drop policy if exists "self_profile_update" on profiles;
drop policy if exists "admin_profile_full_access" on profiles;
drop policy if exists "Enable read for authenticated users" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop the table to be 100% sure
drop table if exists public.profiles cascade;
drop type if exists user_role cascade;

-- ===============================
-- ✅ FRESH SCHEMA (No Recursion)
-- ===============================

-- Create enum
create type user_role as enum ('builder', 'client', 'admin');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  role user_role default 'client',
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- 🛡️ SAFE POLICIES (Guaranteed No Infinite Loop)

-- 1. Read: Everyone can read all profiles (needed for directory/search)
create policy "Enable read access for all users"
  on profiles for select
  using (true);

-- 2. Insert: users can insert their own profile
create policy "Enable insert for users based on user_id"
  on profiles for insert
  with check (auth.uid() = id);

-- 3. Update: users can update only their own profile
create policy "Enable update for users based on user_id"
  on profiles for update
  using (auth.uid() = id);

-- 4. Delete: users can delete only their own profile
create policy "Enable delete for users based on user_id"
  on profiles for delete
  using (auth.uid() = id);

-- 🤖 AUTO-CREATE PROFILE TRIGGER
-- This handles both Email Signup AND Google Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    -- Try to get name from metadata (Google provides this), fallback to email part
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Verify it worked
select count(*) as "Profile Count (Should be 0 if fresh)" from profiles;
