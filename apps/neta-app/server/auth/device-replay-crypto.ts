import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { isDeviceTokenPair, type DeviceTokenPair } from "@neta/api-contracts";

// Covers the native client's 10s HTTP timeout and an immediate retry.
export const REFRESH_REPLAY_TTL_MS = 30_000;
export type ReplayBinding = {
  deviceSessionId: string;
  tokenEpoch: string;
  consumedDigest: string;
  requestDigest: string;
  successorRefreshDigest: string;
  expiresAt: number;
};

function key(secret: string) {
  return createHmac("sha256", secret).update("neta:device-refresh-replay:v1").digest();
}

function aad(binding: ReplayBinding) {
  return Buffer.from(JSON.stringify([
    "neta:device-refresh-replay:v1", binding.deviceSessionId, binding.tokenEpoch,
    binding.consumedDigest, binding.requestDigest, binding.successorRefreshDigest, binding.expiresAt,
  ]));
}

export function sealRefreshReplay(pair: DeviceTokenPair, secret: string, binding: ReplayBinding): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  cipher.setAAD(aad(binding));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(pair), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ciphertext.toString("base64url")].join(".");
}

/** Corrupt, foreign, expired or unauthenticated records never return credentials. */
export function openRefreshReplay(value: string, secret: string, binding: ReplayBinding, now: number): DeviceTokenPair | null {
  if (binding.expiresAt <= now || binding.expiresAt > now + REFRESH_REPLAY_TTL_MS) return null;
  try {
    const [version, iv, tag, ciphertext, extra] = value.split(".");
    if (version !== "v1" || !iv || !tag || !ciphertext || extra !== undefined) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(secret), Buffer.from(iv, "base64url"));
    decipher.setAAD(aad(binding));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const result: unknown = JSON.parse(Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final(),
    ]).toString("utf8"));
    return isDeviceTokenPair(result) ? result : null;
  } catch { return null; }
}
