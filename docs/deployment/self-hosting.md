# Self-Hosting Deployment

Neta has two Docker modes.

## Full-Stack Mode

Use this when the server should run Neta and the bundled Supabase-compatible stack.

Compose file:

```bash
docker-compose.full.yml
```

Services:

- `neta-web`: Next.js app
- `neta-db`: Postgres with pgvector
- `neta-auth`: Supabase Auth
- `neta-rest`: PostgREST
- `neta-storage`: Supabase Storage with local disk backend
- `neta-supabase-proxy`: single public API entrypoint
- `neta-migrations`: Neta database migration runner

Generate production secrets:

```bash
node scripts/generate-full-stack-env.mjs > .env
```

Then adjust these values before starting:

- `NEXT_PUBLIC_SITE_URL`: public Neta URL
- `NEXT_PUBLIC_SUPABASE_URL`: public bundled Supabase API URL
- `NETA_PORT`: host port for Neta when deploying directly with Docker
- `SUPABASE_API_PORT`: host port for the bundled Supabase API
- `POSTGRES_PORT`: host port for backup/manual DB access

Start:

```bash
docker compose -f docker-compose.full.yml up -d --build
```

Check the running stack:

```bash
sh ./scripts/selfhost-doctor.sh
```

To run a real Auth signup/login smoke test, enable the optional check:

```bash
NETA_DOCTOR_AUTH_SMOKE=1 sh ./scripts/selfhost-doctor.sh
```

## App-Only Mode

Use this when Neta connects to an existing Supabase or Supabase-compatible backend.

Compose file:

```bash
docker-compose.yml
```

Required env values:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` only when applying migrations manually

Apply migrations:

```bash
DATABASE_URL='postgresql://postgres:password@host:5432/postgres' sh ./scripts/apply-migrations.sh
```

Start:

```bash
docker compose up -d --build
```

## Coolify

For a no-external-service install, choose Docker Compose deployment and set the compose file to `docker-compose.full.yml`.

Set the generated full-stack env values in Coolify's environment variables. Route the app domain to `neta-web:3000`. If you expose Supabase through a second domain, route it to `neta-supabase-proxy:8000` and set `NEXT_PUBLIC_SUPABASE_URL` to that public URL.

## Dokploy

Create a Compose app from this repository. Use `docker-compose.dokploy.yml` for full-stack deployments and paste the generated env values into the environment panel. This compose file avoids fixed container names and host port bindings so Dokploy can route services itself.

Route the Neta domain to `neta-web` port `3000`. Route the bundled Supabase API domain, if used, to `neta-supabase-proxy` port `8000`.

## Backup And Restore

Full-stack mode stores the database in the `neta-db-data` Docker volume and uploaded files in the `neta-storage-data` Docker volume.

Create a backup:

```bash
sh ./scripts/selfhost-backup.sh
```

The backup is written to `./backups/<timestamp>/` and contains:

- `postgres.dump`: custom-format Postgres dump
- `storage.tar.gz`: local storage archive
- `manifest.txt`: backup metadata

Restore a backup:

```bash
sh ./scripts/selfhost-restore.sh ./backups/20260101T120000Z
```

Set `NETA_RESTORE_FORCE=1` for non-interactive restores:

```bash
NETA_RESTORE_FORCE=1 sh ./scripts/selfhost-restore.sh ./backups/20260101T120000Z
```

## First Admin

Open `/register` after the stack starts. The first registered user becomes the admin, and public registration is locked after that.

Full-stack deployments apply the first-admin registration guard automatically through `neta-migrations`; the installer should not run SQL manually.
