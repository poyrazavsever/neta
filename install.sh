#!/usr/bin/env bash

# Neta - Freelancer Operating System installer

set -euo pipefail

REPO_URL="${NETA_REPO_URL:-https://github.com/poyrazavsever/neta.git}"
TARGET_DIR="${NETA_TARGET_DIR:-neta-os}"
INSTALL_MODE="${NETA_INSTALL_MODE:-}"
APPLY_MIGRATIONS="${NETA_APPLY_MIGRATIONS:-}"
TTY_PATH="${NETA_TTY_PATH:-/dev/tty}"

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

ensure_tty() {
  if ! ( : < "$TTY_PATH" ) 2>/dev/null || ! ( : > "$TTY_PATH" ) 2>/dev/null; then
    fail "Interactive input requires a TTY. Run with a terminal attached or provide the required NETA_* environment variables."
  fi
}

read_from_tty() {
  local label="$1"
  local value

  ensure_tty

  printf "%s" "$label" > "$TTY_PATH"
  IFS= read -r value < "$TTY_PATH" || fail "Input cancelled."
  printf "%s" "$value"
}

read_secret_from_tty() {
  local label="$1"
  local value

  ensure_tty

  printf "%s" "$label" > "$TTY_PATH"
  IFS= read -r -s value < "$TTY_PATH" || fail "Input cancelled."
  printf "\n" > "$TTY_PATH"
  printf "%s" "$value"
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
    value="$(read_from_tty "$label: ")"
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

  value="$(read_from_tty "$label [$default_value]: ")"
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
    value="$(read_secret_from_tty "$label: ")"
    if [ -n "$value" ]; then
      printf -v "$var_name" "%s" "$value"
      export "$var_name"
      return
    fi
    echo "This value is required."
  done
}

choose_install_mode() {
  if [ -n "$INSTALL_MODE" ]; then
    case "$INSTALL_MODE" in
      full|full-stack|bundled)
        INSTALL_MODE="full-stack"
        ;;
      app|app-only|external)
        INSTALL_MODE="app-only"
        ;;
      *)
        fail "Invalid NETA_INSTALL_MODE. Use full-stack or app-only."
        ;;
    esac
    export INSTALL_MODE
    return
  fi

  echo "Choose install mode:"
  echo "  1) full-stack  Neta + bundled Supabase/Postgres/Auth/Storage"
  echo "  2) app-only    Neta app connected to an existing Supabase project"

  while true; do
    answer="$(read_from_tty "Install mode [full-stack]: ")"
    case "${answer:-full-stack}" in
      1|full|full-stack|bundled)
        INSTALL_MODE="full-stack"
        export INSTALL_MODE
        return
        ;;
      2|app|app-only|external)
        INSTALL_MODE="app-only"
        export INSTALL_MODE
        return
        ;;
      *)
        echo "Please choose full-stack or app-only."
        ;;
    esac
  done
}

run_node_script() {
  local script="$1"

  if command -v node >/dev/null 2>&1; then
    node -e "$script"
  else
    docker run --rm \
      -e ROLE="${ROLE:-}" \
      -e JWT_SECRET="${JWT_SECRET:-}" \
      node:22-alpine node -e "$script"
  fi
}

random_secret() {
  run_node_script "console.log(require('crypto').randomBytes(32).toString('hex'))"
}

generate_supabase_jwt() {
  local role="$1"
  local secret="$2"
  ROLE="$role" JWT_SECRET="$secret" run_node_script "const crypto=require('crypto'); const b64=(v)=>Buffer.from(v).toString('base64url'); const header=b64(JSON.stringify({alg:'HS256',typ:'JWT'})); const payload=b64(JSON.stringify({iss:'supabase',ref:'neta',role:process.env.ROLE,iat:1700000000,exp:4102444800})); const unsigned=header+'.'+payload; const sig=crypto.createHmac('sha256', process.env.JWT_SECRET).update(unsigned).digest('base64url'); console.log(unsigned+'.'+sig);"
}

write_env_file() {
  cat > .env <<EOF
NETA_INSTALL_MODE=$INSTALL_MODE
NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
NETA_PORT=$NETA_PORT
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
EOF

  if [ "$INSTALL_MODE" = "full-stack" ]; then
    cat >> .env <<EOF
SUPABASE_API_PORT=$SUPABASE_API_PORT
POSTGRES_PORT=$POSTGRES_PORT
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=${JWT_EXPIRY:-3600}
SMTP_ADMIN_EMAIL=${SMTP_ADMIN_EMAIL:-admin@neta.local}
EOF
  fi

  chmod 600 .env || true
}

configure_app_only() {
  prompt_optional NEXT_PUBLIC_SITE_URL "Public Neta URL" "http://localhost:3000"
  prompt_optional NETA_PORT "Host port for Neta" "3000"
  prompt_required NEXT_PUBLIC_SUPABASE_URL "Supabase API URL"
  prompt_secret_required NEXT_PUBLIC_SUPABASE_ANON_KEY "Supabase anon key"
  prompt_secret_required SUPABASE_SERVICE_ROLE_KEY "Supabase service role key"
}

configure_full_stack() {
  prompt_optional NEXT_PUBLIC_SITE_URL "Public Neta URL" "http://localhost:3000"
  prompt_optional NETA_PORT "Host port for Neta" "3000"
  prompt_optional NEXT_PUBLIC_SUPABASE_URL "Public Supabase API URL" "http://localhost:8000"
  prompt_optional SUPABASE_API_PORT "Host port for bundled Supabase API" "8000"
  prompt_optional POSTGRES_PORT "Host port for bundled Postgres" "54322"

  POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(random_secret)}"
  JWT_SECRET="${JWT_SECRET:-$(random_secret)}"
  NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$(generate_supabase_jwt anon "$JWT_SECRET")}"
  SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$(generate_supabase_jwt service_role "$JWT_SECRET")}"

  export POSTGRES_PASSWORD JWT_SECRET NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY
}

run_compose() {
  local compose="$1"

  if [ "$INSTALL_MODE" = "full-stack" ]; then
    info "Validating full-stack Docker Compose configuration"
    $compose -f docker-compose.full.yml config >/dev/null

    info "Building and starting bundled Neta stack"
    $compose -f docker-compose.full.yml up -d --build
  else
    info "Validating Docker Compose configuration"
    $compose config >/dev/null

    info "Building and starting Neta"
    $compose up -d --build
  fi
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

  choose_install_mode

  if [ "$INSTALL_MODE" = "full-stack" ]; then
    configure_full_stack
  else
    configure_app_only
  fi

  write_env_file
  info "Wrote .env"

  if [ "$INSTALL_MODE" = "app-only" ]; then
    local apply_migrations="$APPLY_MIGRATIONS"

    if [ -z "$apply_migrations" ]; then
      apply_migrations="$(read_from_tty "Apply Neta database migrations now? Requires a direct Postgres DATABASE_URL. [y/N]: ")"
    fi

    if [ "$apply_migrations" = "y" ] || [ "$apply_migrations" = "Y" ]; then
      prompt_secret_required DATABASE_URL "Postgres DATABASE_URL"
      DATABASE_URL="$DATABASE_URL" sh ./scripts/apply-migrations.sh
    else
      echo "Skipping migrations. Run them later with:"
      echo "  DATABASE_URL='postgresql://...' sh ./scripts/apply-migrations.sh"
    fi
  else
    echo "Bundled mode applies migrations automatically through the neta-migrations service."
  fi

  local compose
  compose="$(compose_cmd)"

  run_compose "$compose"

  info "Neta is starting"
  echo "Open: $NEXT_PUBLIC_SITE_URL"
  echo "Create the first admin account at: $NEXT_PUBLIC_SITE_URL/register"
  if [ "$INSTALL_MODE" = "full-stack" ]; then
    echo "Bundled Supabase API: $NEXT_PUBLIC_SUPABASE_URL"
    echo "Bundled Postgres host port: $POSTGRES_PORT"
  fi
}

main "$@"
