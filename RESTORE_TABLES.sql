-- ===============================
-- 🏗️ RESTORE FULL SCHEMA
-- ===============================
-- This script restores Projects, Applications, and Messages tables
-- Run this AFTER FIX_RECURSION.sql

-- Enable extensions (good practice to ensure they exist)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Re-create Enums (if they were dropped)
do $$ begin
    create type project_status as enum ('open', 'in_progress', 'completed', 'cancelled');
exception
    when duplicate_object then null;
end $$;

-- ===============================
-- 📦 PROJECTS
-- ===============================
create table if not exists public.projects (
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
create index if not exists projects_client_idx on projects(client_id);
create index if not exists projects_stack_gin on projects using gin(stack);
create index if not exists projects_status_idx on projects(status);

-- RLS
alter table projects enable row level security;

-- Policies
create policy "Anyone can read open projects"
  on projects for select
  using (status = 'open' or auth.uid() = client_id);

create policy "Clients can create projects"
  on projects for insert
  with check (auth.uid() = client_id);

create policy "Clients can update own projects"
  on projects for update
  using (auth.uid() = client_id);

-- ===============================
-- 🤝 PROJECT APPLICATIONS
-- ===============================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  builder_id uuid references profiles(id) on delete cascade,
  cover_letter text,
  status text default 'pending', -- pending, accepted, rejected
  created_at timestamptz default now(),
  unique(project_id, builder_id)
);

-- Indexes
create index if not exists applications_project_idx on applications(project_id);
create index if not exists applications_builder_idx on applications(builder_id);

-- RLS
alter table applications enable row level security;

-- Policies
create policy "Builders can apply"
  on applications for insert
  with check (auth.uid() = builder_id);

create policy "Builders can view own applications"
  on applications for select
  using (auth.uid() = builder_id);

create policy "Clients can view applications for their projects"
  on applications for select
  using (
    exists (
      select 1 from projects p
      where p.id = project_id
      and p.client_id = auth.uid()
    )
  );

-- ===============================
-- 💬 MESSAGES
-- ===============================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists messages_project_time_idx 
on messages(project_id, created_at desc);

-- RLS
alter table messages enable row level security;

-- Policies
create policy "Project participants can read messages"
  on messages for select
  using (
    exists (
      select 1 from projects p
      where p.id = project_id
      and (p.client_id = auth.uid() or exists (
        select 1 from applications a 
        where a.project_id = p.id 
        and a.builder_id = auth.uid() 
        and a.status = 'accepted'
      ))
    )
    OR sender_id = auth.uid()
  );

create policy "Participants can send messages"
  on messages for insert
  with check (auth.uid() = sender_id); 
