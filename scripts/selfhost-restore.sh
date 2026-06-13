#!/usr/bin/env sh

set -eu

BACKUP_DIR="${1:-}"

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

if [ -z "$BACKUP_DIR" ]; then
  fail "Backup directory is required. Usage: sh ./scripts/selfhost-restore.sh ./backups/20260101T120000Z"
fi

require_command docker
require_command tar
require_container neta-db
require_container neta-storage

[ -f "$BACKUP_DIR/postgres.dump" ] || fail "Missing $BACKUP_DIR/postgres.dump"
[ -f "$BACKUP_DIR/storage.tar.gz" ] || fail "Missing $BACKUP_DIR/storage.tar.gz"

BACKUP_DIR_ABS="$(cd "$BACKUP_DIR" && pwd)"
STORAGE_RESTORE_DIR="$BACKUP_DIR_ABS/.storage-restore"

if [ "${NETA_RESTORE_FORCE:-}" != "1" ]; then
  echo "This will overwrite the current full-stack Neta database and local storage."
  printf "Type RESTORE to continue: "
  read answer
  [ "$answer" = "RESTORE" ] || fail "Restore cancelled."
fi

info "Stopping application services"
docker stop neta-web neta-supabase-proxy neta-storage neta-rest neta-auth >/dev/null 2>&1 || true

info "Restoring Postgres"
docker cp "$BACKUP_DIR_ABS/postgres.dump" neta-db:/tmp/neta-postgres-restore.dump
docker exec neta-db pg_restore \
  -U postgres \
  -d postgres \
  --clean \
  --if-exists \
  /tmp/neta-postgres-restore.dump
docker exec neta-db rm -f /tmp/neta-postgres-restore.dump

info "Restoring Storage"
docker start neta-storage >/dev/null
rm -rf "$STORAGE_RESTORE_DIR"
mkdir -p "$STORAGE_RESTORE_DIR"
tar -xzf "$BACKUP_DIR_ABS/storage.tar.gz" -C "$STORAGE_RESTORE_DIR"
docker exec neta-storage sh -c "rm -rf /var/lib/storage/* /var/lib/storage/.[!.]* /var/lib/storage/..?* 2>/dev/null || true; mkdir -p /var/lib/storage"
docker cp "$STORAGE_RESTORE_DIR/." neta-storage:/var/lib/storage
rm -rf "$STORAGE_RESTORE_DIR"
docker restart neta-storage >/dev/null

info "Starting application services"
docker start neta-auth neta-rest neta-supabase-proxy neta-web >/dev/null

info "Restore completed."
