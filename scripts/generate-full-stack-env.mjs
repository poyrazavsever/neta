#!/usr/bin/env node

import crypto from "node:crypto";

const jwtSecret = process.env.JWT_SECRET || randomSecret();

const values = {
  NETA_INSTALL_MODE: "full-stack",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  NETA_PORT: process.env.NETA_PORT || "3000",
  NEXT_PUBLIC_SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:8000",
  SUPABASE_API_PORT: process.env.SUPABASE_API_PORT || "8000",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || generateSupabaseJwt("anon", jwtSecret),
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    generateSupabaseJwt("service_role", jwtSecret),
  JWT_SECRET: jwtSecret,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || randomSecret(),
  POSTGRES_PORT: process.env.POSTGRES_PORT || "54322",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "3600",
  SMTP_ADMIN_EMAIL: process.env.SMTP_ADMIN_EMAIL || "admin@neta.local",
};

for (const [key, value] of Object.entries(values)) {
  console.log(`${key}=${value}`);
}

function randomSecret() {
  return crypto.randomBytes(32).toString("hex");
}

function generateSupabaseJwt(role, secret) {
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlJson({
    iss: "supabase",
    ref: "neta",
    role,
    iat: 1700000000,
    exp: 4102444800,
  });
  const unsigned = `${header}.${payload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(unsigned)
    .digest("base64url");

  return `${unsigned}.${signature}`;
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
