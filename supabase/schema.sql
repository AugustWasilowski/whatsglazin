-- WhatsGlazin — database schema for The Fine Line
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.

create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- A studio member. Linked to a Supabase auth user once they sign in.
create table if not exists public.members (
  id            text primary key default gen_random_uuid()::text,
  auth_id       uuid unique references auth.users (id) on delete set null,
  slug          text unique not null,
  name          text not null,
  avatar        text,
  member_since  int,
  disciplines   text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- A glaze in the studio library (studio-curated or member-added).
create table if not exists public.glazes (
  id               text primary key default gen_random_uuid()::text,
  slug             text unique not null,
  name             text not null,
  family           text not null,
  cone             int,
  base_hex         text not null,
  shade2_hex       text not null,
  on_color         text not null,
  finish           text not null,
  chemistry        text,
  description      text,
  is_studio_glaze  boolean not null default false,
  created_by       text references public.members (id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists glazes_name_trgm on public.glazes using gin (name gin_trgm_ops);

-- A finished piece.
create table if not exists public.pieces (
  id          text primary key default gen_random_uuid()::text,
  slug        text unique not null,
  title       text,
  maker_id    text references public.members (id) on delete set null,
  form        text,
  clay_body   text,
  firing      text[],
  notes       text,
  created_at  timestamptz not null default now()
);

-- Ordered many-to-many: which glazes are on a piece and in what layer order.
-- position 0 = bottom (down first), higher = on top.
create table if not exists public.piece_glazes (
  piece_id   text not null references public.pieces (id) on delete cascade,
  glaze_id   text not null references public.glazes (id) on delete restrict,
  position   int  not null,
  primary key (piece_id, position)
);
create index if not exists piece_glazes_glaze on public.piece_glazes (glaze_id);

-- Ordered photos for a piece.
create table if not exists public.piece_photos (
  id             text primary key default gen_random_uuid()::text,
  piece_id       text not null references public.pieces (id) on delete cascade,
  url            text not null,
  blur_data_url  text,
  alt            text,
  position       int not null default 0
);
create index if not exists piece_photos_piece on public.piece_photos (piece_id);

-- ----------------------------------------------------------------------------
-- Helper: is the current auth user the maker of this piece?
-- ----------------------------------------------------------------------------
create or replace function public.owns_piece(p_piece_id text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pieces p
    join public.members m on m.id = p.maker_id
    where p.id = p_piece_id and m.auth_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
--   Reads: public (the gallery + glaze library are meant to be browsable).
--   Writes: authenticated members only, scoped to their own content.
-- ----------------------------------------------------------------------------
alter table public.members      enable row level security;
alter table public.glazes       enable row level security;
alter table public.pieces       enable row level security;
alter table public.piece_glazes enable row level security;
alter table public.piece_photos enable row level security;

-- members
drop policy if exists members_read on public.members;
create policy members_read on public.members for select using (true);
drop policy if exists members_update_self on public.members;
create policy members_update_self on public.members for update
  using (auth_id = auth.uid()) with check (auth_id = auth.uid());
drop policy if exists members_insert_self on public.members;
create policy members_insert_self on public.members for insert
  with check (auth_id = auth.uid());

-- glazes: anyone can read; any signed-in member can add a new glaze.
drop policy if exists glazes_read on public.glazes;
create policy glazes_read on public.glazes for select using (true);
drop policy if exists glazes_insert_auth on public.glazes;
create policy glazes_insert_auth on public.glazes for insert
  to authenticated with check (true);

-- pieces: anyone can read; a member can write only their own pieces.
drop policy if exists pieces_read on public.pieces;
create policy pieces_read on public.pieces for select using (true);
drop policy if exists pieces_insert_own on public.pieces;
create policy pieces_insert_own on public.pieces for insert to authenticated
  with check (exists (
    select 1 from public.members m
    where m.id = maker_id and m.auth_id = auth.uid()
  ));
drop policy if exists pieces_modify_own on public.pieces;
create policy pieces_modify_own on public.pieces for update to authenticated
  using (exists (
    select 1 from public.members m
    where m.id = maker_id and m.auth_id = auth.uid()
  ));
drop policy if exists pieces_delete_own on public.pieces;
create policy pieces_delete_own on public.pieces for delete to authenticated
  using (exists (
    select 1 from public.members m
    where m.id = maker_id and m.auth_id = auth.uid()
  ));

-- piece_glazes / piece_photos: public read; write only on pieces you own.
drop policy if exists piece_glazes_read on public.piece_glazes;
create policy piece_glazes_read on public.piece_glazes for select using (true);
drop policy if exists piece_glazes_write on public.piece_glazes;
create policy piece_glazes_write on public.piece_glazes for all to authenticated
  using (public.owns_piece(piece_id)) with check (public.owns_piece(piece_id));

drop policy if exists piece_photos_read on public.piece_photos;
create policy piece_photos_read on public.piece_photos for select using (true);
drop policy if exists piece_photos_write on public.piece_photos;
create policy piece_photos_write on public.piece_photos for all to authenticated
  using (public.owns_piece(piece_id)) with check (public.owns_piece(piece_id));

-- ----------------------------------------------------------------------------
-- Storage: a public-read bucket for piece photos.
-- Members upload under a path prefixed with their own member id, and the
-- policies below ENFORCE that prefix — a member can only write or delete files
-- under their own folder, never overwrite or remove another member's photos.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('pieces', 'pieces', true)
on conflict (id) do nothing;

-- The caller's member id, used to gate storage writes to their own folder.
create or replace function public.current_member_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from public.members where auth_id = auth.uid();
$$;

drop policy if exists pieces_photos_read on storage.objects;
create policy pieces_photos_read on storage.objects for select
  using (bucket_id = 'pieces');

-- Insert only under `<my-member-id>/…`, and only real raster image extensions.
-- Mirrors the server action's validation as a defense-in-depth backstop for
-- anyone calling the Storage API directly with their own JWT.
drop policy if exists pieces_photos_upload on storage.objects;
create policy pieces_photos_upload on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pieces'
    and (storage.foldername(name))[1] = public.current_member_id()
    and lower(storage.extension(name)) = any (
      array['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif']
    )
  );

-- Update (upsert overwrites) is also gated to the owner's own folder.
drop policy if exists pieces_photos_update on storage.objects;
create policy pieces_photos_update on storage.objects for update to authenticated
  using (
    bucket_id = 'pieces'
    and (storage.foldername(name))[1] = public.current_member_id()
  )
  with check (
    bucket_id = 'pieces'
    and (storage.foldername(name))[1] = public.current_member_id()
  );

drop policy if exists pieces_photos_delete on storage.objects;
create policy pieces_photos_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'pieces'
    and (storage.foldername(name))[1] = public.current_member_id()
  );

-- ----------------------------------------------------------------------------
-- Storage: a public-read bucket for member avatar photos. Same owner-folder
-- rule as pieces — a member may only write/replace/delete under `<member-id>/`.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_upload on storage.objects;
create policy avatars_upload on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_member_id()
    and lower(storage.extension(name)) = any (
      array['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif']
    )
  );

drop policy if exists avatars_update on storage.objects;
create policy avatars_update on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_member_id()
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_member_id()
  );

drop policy if exists avatars_delete on storage.objects;
create policy avatars_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = public.current_member_id()
  );

-- ----------------------------------------------------------------------------
-- Auto-create a member row on first sign-in.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.members (auth_id, slug, name, member_since)
  values (
    new.id,
    'm-' || substr(new.id::text, 1, 8),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    extract(year from now())::int
  )
  on conflict (auth_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
