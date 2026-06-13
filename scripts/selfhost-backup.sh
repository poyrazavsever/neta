#!/usr/bin/env sh

set -eu

BACKUP_ROOT="${NETA_BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="$BACKUP_ROOT/$STAMP"

info() {
  printf "%s\n" "$1"
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required."
}

require_container() {
  name="$1"
  docker inspect "$name" >/dev/null 2>&1 || fail "Container '$name' was not found."
}

require_command docker
require_command tar
require_container neta-db
require_container neta-storage

mkdir -p "$BACKUP_DIR"
BACKUP_DIR_ABS="$(cd "$BACKUP_DIR" && pwd)"

info "Creating Postgres backup"
docker exec neta-db pg_dump \
  -U postgres \
  -d postgres \
  --format=custom \
  --clean \
  --if-exists \
  --file=/tmp/neta-postgres.dump
docker cp neta-db:/tmp/neta-postgres.dump "$BACKUP_DIR_ABS/postgres.dump"
docker exec neta-db rm -f /tmp/neta-postgres.dump

info "Creating Storage backup"
docker cp neta-storage:/var/lib/storage "$BACKUP_DIR_ABS/storage"
tar -czf "$BACKUP_DIR_ABS/storage.tar.gz" -C "$BACKUP_DIR_ABS/storage" .
rm -rf "$BACKUP_DIR_ABS/storage"

cat > "$BACKUP_DIR_ABS/manifest.txt" <<EOF
neta_backup_version=1
created_at_utc=$STAMP
postgres_dump=postgres.dump
storage_archive=storage.tar.gz
EOF

info "Backup created: $BACKUP_DIR_ABS"
