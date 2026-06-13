#!/usr/bin/env sh

set -u

FAILURES=0

pass() {
  printf "ok   %s\n" "$1"
}

fail() {
  printf "fail %s\n" "$1"
  FAILURES=$((FAILURES + 1))
}

check_container_running() {
  name="$1"
  if docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null | grep -q true; then
    pass "$name is running"
  else
    fail "$name is not running"
  fi
}

check_container_exit_zero() {
  name="$1"
  if [ "$(docker inspect -f '{{.State.ExitCode}}' "$name" 2>/dev/null)" = "0" ]; then
    pass "$name exited successfully"
  else
    fail "$name did not exit successfully"
  fi
}

check_container_health() {
  name="$1"
  status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$name" 2>/dev/null || true)"
  if [ "$status" = "healthy" ]; then
    pass "$name health is $status"
  else
    fail "$name health is $status"
  fi
}

check_exec() {
  label="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    pass "$label"
  else
    fail "$label"
  fi
}

if ! command -v docker >/dev/null 2>&1; then
  echo "fail docker is not installed"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "fail docker daemon is not reachable"
  exit 1
fi

for container in neta-db neta-auth neta-rest neta-storage neta-supabase-proxy neta-web; do
  check_container_running "$container"
done

check_container_exit_zero neta-migrations
check_container_health neta-db
check_container_health neta-web
check_container_health neta-supabase-proxy

check_exec "web health endpoint returns JSON" \
  docker exec neta-web wget -qO- http://127.0.0.1:3000/api/health

check_exec "supabase proxy health endpoint responds" \
  docker exec neta-supabase-proxy wget -qO- http://127.0.0.1:8000/health

check_exec "auth settings endpoint responds through proxy" \
  docker exec neta-supabase-proxy wget -qO- http://127.0.0.1:8000/auth/v1/settings

check_exec "database contains Neta tables" \
  docker exec neta-db sh -c "psql -U postgres -d postgres -tAc \"select to_regclass('public.profiles') is not null and to_regclass('public.projects') is not null\" | grep -q t"

if [ "${NETA_DOCTOR_AUTH_SMOKE:-0}" = "1" ]; then
  profile_count="$(docker exec neta-db sh -c "psql -U postgres -d postgres -tAc \"select count(*) from public.profiles\"" 2>/dev/null | tr -d "[:space:]")"

  if [ "$profile_count" = "0" ]; then
    check_exec "auth signup/login smoke succeeds" \
      docker exec neta-web node -e '
const apiUrl = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = `doctor-${Date.now()}@neta.local`;
const password = "Test123456!";
const headers = {
  apikey: anonKey,
  authorization: `Bearer ${anonKey}`,
  "content-type": "application/json",
};

async function request(path, body) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

(async () => {
  const signup = await request("/auth/v1/signup", { email, password });
  const login = await request("/auth/v1/token?grant_type=password", { email, password });
  if (!signup.user?.id || !login.access_token || signup.user.id !== login.user?.id) {
    throw new Error("signup/login response did not include a matching user and token");
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
'
  else
    check_exec "auth password endpoint rejects invalid login without database errors" \
      docker exec neta-web node -e '
const apiUrl = process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = `doctor-${Date.now()}@neta.local`;
const headers = {
  apikey: anonKey,
  authorization: `Bearer ${anonKey}`,
  "content-type": "application/json",
};

(async () => {
  const response = await fetch(`${apiUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password: "NotARealPassword123!" }),
  });
  if (response.status >= 500) {
    throw new Error(`password endpoint returned ${response.status}: ${await response.text()}`);
  }
  if (response.ok) {
    throw new Error("invalid credentials unexpectedly succeeded");
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
'
  fi
fi

if [ "$FAILURES" -gt 0 ]; then
  printf "\n%d check(s) failed.\n" "$FAILURES"
  exit 1
fi

printf "\nAll self-host checks passed.\n"
