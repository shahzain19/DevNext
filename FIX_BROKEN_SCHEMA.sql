-- ==========================================
-- 🛠️ FIX BROKEN RELATIONSHIPS & RE-SEED
-- ==========================================

-- 🛑 PROBLEM:
-- When we fixed the "Recursion" bug by dropping 'profiles', 
-- Postgres automatically deleted the Foreign Key links in other tables.
-- The tables exist, but they are "orphaned" (unlinked), causing 400 errors.

-- ✅ SOLUTION:
-- We must recreate these tables to link them to the NEW profiles table.

-- 1. DROP ORPHANED TABLES
drop table if exists public.messages cascade;
drop table if exists public.applications cascade;
drop table if exists public.projects cascade;
drop type if exists project_status cascade;

-- 2. RE-CREATE TABLES (Correctly Linked)
-- ==========================================

create type project_status as enum ('open', 'in_progress', 'completed', 'cancelled');

-- 📦 PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references profiles(id) on delete cascade, -- Link restored!
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

-- RLS
alter table projects enable row level security;
create policy "Read projects" on projects for select using (true);
create policy "Create projects" on projects for insert with check (auth.uid() = client_id);
create policy "Update own projects" on projects for update using (auth.uid() = client_id);

-- 🤝 APPLICATIONS
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  builder_id uuid references profiles(id) on delete cascade, -- Link restored!
  cover_letter text,
  status text default 'pending',
  created_at timestamptz default now(),
  unique(project_id, builder_id)
);

-- RLS
alter table applications enable row level security;
create policy "Builders apply" on applications for insert with check (auth.uid() = builder_id);
create policy "View own apps" on applications for select using (auth.uid() = builder_id);
create policy "Clients view project apps" on applications for select using (
  exists (select 1 from projects p where p.id = project_id and p.client_id = auth.uid())
);
create policy "Clients update status" on applications for update using (
  exists (select 1 from projects p where p.id = project_id and p.client_id = auth.uid())
);

-- 💬 MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade, -- Link restored!
  content text not null,
  created_at timestamptz default now()
);

-- RLS
alter table messages enable row level security;
create policy "Read messages" on messages for select using (true); -- Simplified for demo
create policy "Send messages" on messages for insert with check (auth.uid() = sender_id);


-- 3. RE-SEED DATA
-- ==========================================

-- Get the Client ID (TechStart Inc) created earlier
do $$
declare
  client_user_id uuid;
begin
  select id into client_user_id from profiles where email = 'founder@techstart.io' limit 1;

  if client_user_id is not null then
    -- Seed Projects linked to this client
    insert into public.projects (id, client_id, title, description, budget_min, budget_max, stack, status)
    values 
    (
      'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
      client_user_id,
      'E-commerce Platform Migration',
      'We need to migrate our existing Shopify store to a custom Next.js solution. Looking for an expert who can handle complex data migration and build a high-converting storefront.',
      5000,
      10000,
      ARRAY['Next.js', 'Shopify', 'PostgreSQL', 'Stripe'],
      'open'
    ),
    (
      'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      client_user_id,
      'AI-Powered MVP Development',
      'Building an MVP for an AI text generation tool. Need a full-stack developer who understands LLM integration (OpenAI API).',
      8000,
      15000,
      ARRAY['Python', 'FastAPI', 'React', 'OpenAI'],
      'open'
    )
    on conflict (id) do nothing;
  end if;
end $$;
