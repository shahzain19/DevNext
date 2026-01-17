-- ===============================
-- 🧨 NUKE EVERYTHING (Clean Slate)
-- ===============================
-- Drop everything first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop policy if exists "Enable read for authenticated users" on profiles;
drop policy if exists "Enable insert for authenticated users" on profiles;
drop policy if exists "Enable update for users based on id" on profiles;
drop table if exists public.profiles cascade;
drop type if exists user_role;

-- ===============================
-- ✅ SIMPLIFIED SCHEMA
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

-- Simple RLS policies (NO RECURSION!)
create policy "Enable read for authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Enable insert for authenticated users"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Enable update for users based on id"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===============================
-- ✅ DONE! Try signup/Google auth now.
-- ===============================
