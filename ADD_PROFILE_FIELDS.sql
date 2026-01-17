-- ==========================================
-- 🎨 ADD PROFILE FIELDS & STORAGE
-- ==========================================

-- 1. ADD COLUMNS
-- ==========================================
alter table public.profiles 
add column if not exists phone text,
add column if not exists cover_url text;

-- 2. SETUP STORAGE BUCKETS
-- ==========================================

-- Create buckets if they don't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- 3. STORAGE POLICIES (Avatars)
-- ==========================================
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' );

-- 4. STORAGE POLICIES (Covers)
-- ==========================================
create policy "Cover images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'covers' );

create policy "Anyone can upload a cover"
  on storage.objects for insert
  with check ( bucket_id = 'covers' );

create policy "Anyone can update their own cover"
  on storage.objects for update
  using ( bucket_id = 'covers' );

-- 5. UPDATE EXISTING DATA (Optional)
-- ==========================================
-- Set a default cover for existing profiles
update public.profiles
set cover_url = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop'
where cover_url is null;
