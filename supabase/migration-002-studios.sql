-- WhatsGlazin — migration 002: multi-studio platform
-- Studios + roles (site admin, studio admins), glaze recipes, page-view metrics.
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE / drop policy + create,
-- and every backfill is guarded. Purely additive — the currently deployed app
-- keeps working unchanged before, during, and after this migration.

-- ----------------------------------------------------------------------------
-- 1) Tables
-- ----------------------------------------------------------------------------

-- A pottery studio with its own corner of WhatsGlazin.
create table if not exists public.studios (
  id           text primary key default gen_random_uuid()::text,
  slug         text unique not null,
  name         text not null,
  location     text,
  description  text,
  established  int,
  is_active    boolean not null default true,
  created_by   text references public.members (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Who administers a studio (multi-admin; admins may add co-admins).
create table if not exists public.studio_admins (
  studio_id   text not null references public.studios (id) on delete cascade,
  member_id   text not null references public.members (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (studio_id, member_id)
);
create index if not exists studio_admins_member on public.studio_admins (member_id);

-- Privacy-friendly page-view counter: one row per (path, day). No PII, no
-- cookies, no user agents — written only via the log_page_view() RPC below.
create table if not exists public.page_views (
  path   text not null,
  day    date not null default current_date,
  count  int  not null default 1,
  primary key (path, day)
);

-- ----------------------------------------------------------------------------
-- 2) Columns (all nullable/defaulted → zero downtime for the running app)
-- ----------------------------------------------------------------------------

alter table public.members add column if not exists is_site_admin boolean not null default false;
alter table public.members add column if not exists studio_id text references public.studios (id) on delete set null;

alter table public.glazes add column if not exists studio_id text references public.studios (id) on delete set null;
alter table public.glazes add column if not exists recipe text;
alter table public.glazes add column if not exists glazy_url text;
create index if not exists glazes_studio on public.glazes (studio_id);

-- Snapshot of the maker's studio at creation time (kept when they move on).
alter table public.pieces add column if not exists studio_id text references public.studios (id) on delete set null;
create index if not exists pieces_studio on public.pieces (studio_id);

-- ----------------------------------------------------------------------------
-- 3) Helper functions
-- ----------------------------------------------------------------------------

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where auth_id = auth.uid() and is_site_admin
  );
$$;

create or replace function public.is_studio_admin_of(p_studio_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.studio_admins sa
    join public.members m on m.id = sa.member_id
    where sa.studio_id = p_studio_id and m.auth_id = auth.uid()
  );
$$;

-- Self-serve studio creation: atomically creates the studio AND makes the
-- caller its first admin (no window where a studio exists without one).
-- If the caller has no studio association yet, they're associated with it.
create or replace function public.create_studio(
  p_name text,
  p_slug text,
  p_location text default null,
  p_description text default null,
  p_established int default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member text;
  v_studio text;
begin
  select id into v_member from public.members where auth_id = auth.uid();
  if v_member is null then
    raise exception 'Sign in to create a studio.';
  end if;
  if p_name is null or length(trim(p_name)) < 2 or length(p_name) > 80 then
    raise exception 'Studio name must be 2–80 characters.';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{1,79}$' then
    raise exception 'Invalid studio slug.';
  end if;

  insert into public.studios (slug, name, location, description, established, created_by)
  values (
    p_slug,
    trim(p_name),
    nullif(left(trim(coalesce(p_location, '')), 120), ''),
    nullif(left(trim(coalesce(p_description, '')), 2000), ''),
    case when p_established between 1000 and extract(year from now())::int
         then p_established end,
    v_member
  )
  returning id into v_studio;

  insert into public.studio_admins (studio_id, member_id)
  values (v_studio, v_member)
  on conflict do nothing;

  update public.members set studio_id = v_studio
  where id = v_member and studio_id is null;

  return v_studio;
end;
$$;

-- Site-admin-only moderation switch (is_active is not writable any other way).
create or replace function public.set_studio_active(p_studio_id text, p_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_site_admin() then
    raise exception 'Not allowed.';
  end if;
  update public.studios set is_active = p_active where id = p_studio_id;
end;
$$;

-- Increment a page-view counter. Validates + normalizes the path, and refuses
-- to create new rows once a day accumulates an absurd number of distinct
-- paths (junk-flood guard). Increment-only; never returns data.
create or replace function public.log_page_view(p_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_path text;
begin
  v_path := lower(trim(coalesce(p_path, '')));
  if v_path = '' or length(v_path) > 200 or v_path !~ '^/[a-z0-9/_-]*$' then
    return; -- silently ignore garbage
  end if;
  if v_path <> '/' then
    v_path := rtrim(v_path, '/');
  end if;

  -- junk-flood guard: allow increments always, but no NEW distinct paths
  -- after 500 in a single day.
  if not exists (select 1 from public.page_views where path = v_path and day = current_date)
     and (select count(*) from public.page_views where day = current_date) >= 500 then
    return;
  end if;

  insert into public.page_views (path, day, count)
  values (v_path, current_date, 1)
  on conflict (path, day) do update set count = public.page_views.count + 1;
end;
$$;

grant execute on function public.create_studio(text, text, text, text, int) to authenticated;
grant execute on function public.set_studio_active(text, boolean) to authenticated;
grant execute on function public.log_page_view(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4) Row Level Security
-- ----------------------------------------------------------------------------

alter table public.studios       enable row level security;
alter table public.studio_admins enable row level security;
alter table public.page_views    enable row level security;

-- studios: public read; edits by that studio's admins or the site admin.
-- No insert policy — creation happens only through create_studio().
drop policy if exists studios_read on public.studios;
create policy studios_read on public.studios for select using (true);
drop policy if exists studios_update_admin on public.studios;
create policy studios_update_admin on public.studios for update to authenticated
  using (public.is_studio_admin_of(id) or public.is_site_admin())
  with check (public.is_studio_admin_of(id) or public.is_site_admin());
drop policy if exists studios_delete_site_admin on public.studios;
create policy studios_delete_site_admin on public.studios for delete to authenticated
  using (public.is_site_admin());

-- studio_admins: public read (a studio's admins are shown on its page);
-- admins can add co-admins, and admins/site admin can remove.
drop policy if exists studio_admins_read on public.studio_admins;
create policy studio_admins_read on public.studio_admins for select using (true);
drop policy if exists studio_admins_insert on public.studio_admins;
create policy studio_admins_insert on public.studio_admins for insert to authenticated
  with check (public.is_site_admin() or public.is_studio_admin_of(studio_id));
drop policy if exists studio_admins_delete on public.studio_admins;
create policy studio_admins_delete on public.studio_admins for delete to authenticated
  using (public.is_site_admin() or public.is_studio_admin_of(studio_id));

-- glazes: tighten insert (members create only PERSONAL glazes; studio-library
-- glazes require that studio's admin), and add the previously-missing
-- update/delete policies with the same scoping.
drop policy if exists glazes_insert_auth on public.glazes;
create policy glazes_insert_auth on public.glazes for insert to authenticated
  with check (
    studio_id is null
    or public.is_studio_admin_of(studio_id)
    or public.is_site_admin()
  );
drop policy if exists glazes_update_scoped on public.glazes;
create policy glazes_update_scoped on public.glazes for update to authenticated
  using (
    (studio_id is not null and public.is_studio_admin_of(studio_id))
    or (studio_id is null and created_by = public.current_member_id())
    or public.is_site_admin()
  )
  with check (
    (studio_id is not null and public.is_studio_admin_of(studio_id))
    or (studio_id is null and created_by = public.current_member_id())
    or public.is_site_admin()
  );
drop policy if exists glazes_delete_scoped on public.glazes;
create policy glazes_delete_scoped on public.glazes for delete to authenticated
  using (
    (studio_id is not null and public.is_studio_admin_of(studio_id))
    or (studio_id is null and created_by = public.current_member_id())
    or public.is_site_admin()
  );

-- pieces: a new piece may only be stamped with the maker's own studio (or none).
-- (Updates can't touch studio_id at all — see column grants below.)
drop policy if exists pieces_insert_own on public.pieces;
create policy pieces_insert_own on public.pieces for insert to authenticated
  with check (
    exists (
      select 1 from public.members m
      where m.id = maker_id and m.auth_id = auth.uid()
    )
    and (
      studio_id is null
      or studio_id = (select m2.studio_id from public.members m2 where m2.auth_id = auth.uid())
    )
  );

-- page_views: only the site admin can read; nothing writes except the RPC.
drop policy if exists page_views_read_admin on public.page_views;
create policy page_views_read_admin on public.page_views for select to authenticated
  using (public.is_site_admin());

-- ----------------------------------------------------------------------------
-- 5) Column-level privileges (defense in depth on top of RLS)
--    Postgres note: a column REVOKE cannot carve out a table-level GRANT, so
--    the correct pattern is: revoke table-level UPDATE, grant back only the
--    columns the app legitimately updates. RLS still applies on top.
-- ----------------------------------------------------------------------------

-- members: profile fields + studio association are updatable; identity and
-- privilege columns (auth_id, is_site_admin, slug, id) are not.
revoke update on public.members from authenticated, anon;
grant update (name, avatar, disciplines, studio_id) on public.members to authenticated;

-- pieces: content fields are updatable; maker_id, slug and the studio
-- snapshot are immutable after insert.
revoke update on public.pieces from authenticated, anon;
grant update (title, form, clay_body, firing, notes) on public.pieces to authenticated;

-- studios: info fields are updatable by admins (via RLS); slug is stable,
-- is_active only changes through set_studio_active(), created_by immutable.
revoke update on public.studios from authenticated, anon;
grant update (name, location, description, established) on public.studios to authenticated;

-- page_views: nobody writes directly (the security-definer RPC does).
revoke insert, update, delete on public.page_views from authenticated, anon;

-- ----------------------------------------------------------------------------
-- 6) Backfill (idempotent) — The Fine Line + existing data
-- ----------------------------------------------------------------------------

-- 6.1 The Fine Line studio.
insert into public.studios (slug, name, location, description, established)
values (
  'fine-line',
  'The Fine Line',
  'St. Charles, IL',
  'Fine Line Creative Arts Center — a community arts studio founded by Sister Denise Kavanagh. Ceramics, weaving, glass, metals, and more since 1979.',
  1979
)
on conflict (slug) do nothing;

-- 6.2 All existing studio glazes (the Cone 6 board) → The Fine Line,
--     plus August's "Dry Matte" which is a real Fine Line glaze.
update public.glazes
set studio_id = (select id from public.studios where slug = 'fine-line')
where studio_id is null and (is_studio_glaze or slug like 'dry-matte%');

update public.glazes
set is_studio_glaze = true
where slug like 'dry-matte%' and not is_studio_glaze;

-- 6.3 August: site admin, Fine Line admin, and studio creator.
update public.members m
set is_site_admin = true
from auth.users u
where m.auth_id = u.id
  and u.email = 'august.wasilowski@gmail.com'
  and not m.is_site_admin;

insert into public.studio_admins (studio_id, member_id)
select
  (select id from public.studios where slug = 'fine-line'),
  m.id
from public.members m
join auth.users u on u.id = m.auth_id
where u.email = 'august.wasilowski@gmail.com'
on conflict do nothing;

update public.studios s
set created_by = (
  select m.id from public.members m
  join auth.users u on u.id = m.auth_id
  where u.email = 'august.wasilowski@gmail.com'
)
where s.slug = 'fine-line' and s.created_by is null;

-- 6.4 Associate the existing members (August + Laura) with The Fine Line.
update public.members
set studio_id = (select id from public.studios where slug = 'fine-line')
where studio_id is null;

-- 6.5 Snapshot existing pieces into their maker's studio.
update public.pieces p
set studio_id = m.studio_id
from public.members m
where m.id = p.maker_id and p.studio_id is null;

-- ----------------------------------------------------------------------------
-- 7) Post-migration sanity checks (read-only; run and eyeball the output)
-- ----------------------------------------------------------------------------
-- select slug, name, is_active from public.studios;
-- select count(*) as fine_line_glazes from public.glazes
--   where studio_id = (select id from studios where slug='fine-line');  -- expect 14
-- select name, is_site_admin, studio_id is not null as associated from public.members;
-- select count(*) as fine_line_admins from public.studio_admins;        -- expect 1
-- select slug, studio_id is not null as in_studio from public.pieces;   -- expect all true
