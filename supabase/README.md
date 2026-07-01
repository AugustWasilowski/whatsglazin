# Supabase setup

Project ref: `znlqvdyutuohqvriffum`

## One-time setup

1. Open the [SQL Editor](https://supabase.com/dashboard/project/znlqvdyutuohqvriffum/sql/new).
2. Paste the contents of **`schema.sql`** and run it. This creates the tables
   (`members`, `glazes`, `pieces`, `piece_glazes`, `piece_photos`), the row-level
   security policies, the `pieces` storage bucket, and the new-user trigger.
3. Paste the contents of **`seed.sql`** and run it. This loads the 13 Cone 6
   glazes (plus demo members/pieces). Re-running it is safe — it upserts.

The SQL editor runs as a superuser, so it bypasses RLS for setup/seed. No key
required for these steps.

## Regenerating the seed

`seed.sql` is generated from the typed data in `src/lib/` so it never drifts:

```bash
npm run seed:gen
```

## Auth providers

Enable in [Authentication → Providers](https://supabase.com/dashboard/project/znlqvdyutuohqvriffum/auth/providers):
- **Email** — sign-in is a 6-digit OTP code emailed to the member (on by default).
- **Google** — needs a Google Cloud OAuth client.

Set the email OTP length to **6 digits** under Authentication → Email templates /
provider settings so it matches the sign-in form.

Redirect URLs to add (Authentication → URL Configuration):
- `http://localhost:3000/auth/callback` (dev)
- `https://whatsglazin.com/auth/callback` (prod)
