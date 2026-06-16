<img src="public/logo/lightLogoLong.png" height="200" alt="Neta Icon" />

# Neta

Neta is a freelancer operating system built with Next.js and Supabase. It manages clients, projects, tasks, finance, daily logs, analytics, AI chat, and a limited client portal.

This repository now ships only the web application. It does not bundle Supabase, PostgreSQL, Docker Compose, installers, migration runners, or backup scripts. Bring your own Supabase project and provide the required environment variables in the deploy platform.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Poyraz UI
- Supabase Auth, Postgres, Storage, and RLS
- Vercel AI SDK

## Requirements

1. A Supabase project that already contains Neta's database schema, RLS policies, RPC functions, and storage buckets.
2. Supabase project credentials:
   - Project URL
   - Anon/public key
   - Service role key
3. Node.js 20 or newer.

See `docs/04-supabase-kurulumu.md` for the expected Supabase-side resources.

For a fresh Supabase project, run the one-shot setup SQL:

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -v ON_ERROR_STOP=1 -f supabase/setup.sql
```

You can also paste the full contents of `supabase/setup.sql` into Supabase SQL Editor and run it once.

## Environment Variables

Copy `.env.example` to `.env.local` for local development, or add the same values in Vercel, Coolify, Dokploy, or your hosting provider.

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

## Deploy

### Vercel

1. Import the GitHub repository.
2. Add the environment variables from `.env.example`.
3. Deploy with the default Next.js settings.

### Coolify or Dokploy

1. Create a standard Next.js application from this GitHub repository.
2. Use the platform's normal install/build/start commands:
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm run start`
3. Add the environment variables from `.env.example`.

No Dockerfile or Compose file is required.

## First Admin

After deploying against a prepared Supabase project, open `/register` once to create the first freelancer/admin account. Registration is locked after the first admin profile exists.

## License

This project is proprietary and intended for personal self-hosting with an external Supabase project.
