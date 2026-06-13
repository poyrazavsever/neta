#!/usr/bin/env bash

# Neta - Freelancer Operating System installer

set -euo pipefail

REPO_URL="${NETA_REPO_URL:-https://github.com/poyrazavsever/neta.git}"
TARGET_DIR="${NETA_TARGET_DIR:-neta-os}"

info() {
  printf "\n%s\n" "$1"
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is required."
}

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
  elif command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  else
    fail "Docker Compose is required."
  fi
}

prompt_required() {
  local var_name="$1"
  local label="$2"
  local current_value="${!var_name:-}"
  local value

  if [ -n "$current_value" ]; then
    return
  fi

  while true; do
    read -r -p "$label: " value
    if [ -n "$value" ]; then
      printf -v "$var_name" "%s" "$value"
      export "$var_name"
      return
    fi
    echo "This value is required."
  done
}

prompt_optional() {
  local var_name="$1"
  local label="$2"
  local default_value="$3"
  local current_value="${!var_name:-}"
  local value

  if [ -n "$current_value" ]; then
    return
  fi

  read -r -p "$label [$default_value]: " value
  printf -v "$var_name" "%s" "${value:-$default_value}"
  export "$var_name"
}

prompt_secret_required() {
  local var_name="$1"
  local label="$2"
  local current_value="${!var_name:-}"
  local value

  if [ -n "$current_value" ]; then
    return
  fi

  while true; do
    read -r -s -p "$label: " value
    echo
    if [ -n "$value" ]; then
      printf -v "$var_name" "%s" "$value"
      export "$var_name"
      return
    fi
    echo "This value is required."
  done
}

write_env_file() {
  cat > .env <<EOF
NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
NETA_PORT=$NETA_PORT
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
EOF
  chmod 600 .env || true
}

main() {
  info "Neta self-host installer"

  require_command git
  require_command docker
  docker info >/dev/null 2>&1 || fail "Docker is installed but the daemon is not reachable."

  if [ -d "$TARGET_DIR" ]; then
    fail "'$TARGET_DIR' already exists. Set NETA_TARGET_DIR or remove the directory."
  fi

  info "Cloning Neta into $TARGET_DIR"
  git clone "$REPO_URL" "$TARGET_DIR"
  cd "$TARGET_DIR"

  prompt_optional NEXT_PUBLIC_SITE_URL "Public Neta URL" "http://localhost:3000"
  prompt_optional NETA_PORT "Host port for Neta" "3000"
  prompt_required NEXT_PUBLIC_SUPABASE_URL "Supabase API URL"
  prompt_secret_required NEXT_PUBLIC_SUPABASE_ANON_KEY "Supabase anon key"
  prompt_secret_required SUPABASE_SERVICE_ROLE_KEY "Supabase service role key"

  write_env_file
  info "Wrote .env"

  read -r -p "Apply Neta database migrations now? Requires a direct Postgres DATABASE_URL. [y/N]: " apply_migrations
  if [ "$apply_migrations" = "y" ] || [ "$apply_migrations" = "Y" ]; then
    prompt_secret_required DATABASE_URL "Postgres DATABASE_URL"
    DATABASE_URL="$DATABASE_URL" bash ./scripts/apply-migrations.sh
  else
    echo "Skipping migrations. Run them later with:"
    echo "  DATABASE_URL='postgresql://...' bash ./scripts/apply-migrations.sh"
  fi

  local compose
  compose="$(compose_cmd)"

  info "Validating Docker Compose configuration"
  $compose config >/dev/null

  info "Building and starting Neta"
  $compose up -d --build

  info "Neta is starting"
  echo "Open: $NEXT_PUBLIC_SITE_URL"
  echo "Create the first admin account at: $NEXT_PUBLIC_SITE_URL/register"
}

main "$@"
