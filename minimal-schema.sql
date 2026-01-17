-- ===============================
-- 🧨 NUKE EVERYTHING (Clean Slate)
-- ===============================
-- WARNING: This will DELETE all data! Only run if you want to start fresh.

-- Drop trigger first
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions
drop function if exists public.handle_new_user();

-- Drop policies
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Anyone can read verified profiles" on profiles;

-- Drop table
drop table if exists public.profiles cascade;

-- Drop enums
drop type if exists verification_status;
drop type if exists project_status;
drop type if exists user_role;

-- ===============================
-- 🚀 MINIMAL SCHEMA FOR TESTING
-- ===============================
-- Run this first to get the app working, then run the full schema later

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create enums
create type user_role as enum ('builder', 'client', 'admin');
create type project_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type verification_status as enum ('pending', 'approved', 'rejected');

-- Create profiles table (REQUIRED for signup to work)
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

-- Enable RLS
alter table profiles enable row level security;

-- Basic policies
create policy "Users can read own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

create policy "Anyone can read verified profiles"
on profiles for select
using (verification = 'approved');

-- CRITICAL: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client')::user_role,
    coalesce(new.raw_user_meta_data->>'name', 'New User')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- ===============================
-- ✅ THAT'S IT! Try signup now.
-- Run the full supabase-schema.sql later for all features.
-- ===============================
