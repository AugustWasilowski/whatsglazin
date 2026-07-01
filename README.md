# WhatsGlazin

A living gallery and glaze library for **The Fine Line** pottery studio. Members
snap a finished piece straight off the kiln shelf, log the glazes they used, and
it joins a gallery the whole studio can browse and search — by color, glaze,
maker, and combination.

## Stack

- **Next.js 16** (App Router) + **React 19**, TypeScript
- **Tailwind CSS v4**
- **Supabase** — Postgres + Row Level Security, Auth (email OTP), Storage
- **GSAP** for gallery motion, **Fuse.js** for fuzzy search
- Deployed to **Fly.io** (standalone Docker output)

## Getting started

1. **Install**

   ```bash
   npm install
   ```

2. **Configure environment** — copy the template and fill in your Supabase
   project values:

   ```bash
   cp .env.example .env
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` — your project URL (`https://<ref>.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the anon/publishable key (RLS enforces access)

   The anon key is the only key the app needs; every write goes through RLS.

3. **Set up the database** — follow [`supabase/README.md`](supabase/README.md):
   run `schema.sql` (tables, RLS, storage bucket, new-user trigger) then
   `seed.sql` (studio glazes + demo content) in the Supabase SQL editor. Enable
   the **Email** provider and set the OTP length to **6 digits**.

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — local dev server
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint
- `npm run seed:gen` — regenerate `supabase/seed.sql` from the typed data in `src/lib/`

## Project layout

- `src/app/(marketing)` — public landing page
- `src/app/(app)` — the studio app (gallery, glazes, members, add/edit piece, you)
- `src/app/auth` — OTP sign-in, callback, sign-out
- `src/lib` — Supabase clients, data access (`db.ts`), server actions (`actions.ts`)
- `supabase/` — schema, seed, and setup notes

## Deployment

Configured for Fly.io via `fly.toml` and the multi-stage `Dockerfile`
(`output: "standalone"`). Set `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as build-time env/secrets so the image host and
client are wired correctly. CI deploys from `.github/workflows/fly-deploy.yml`.
