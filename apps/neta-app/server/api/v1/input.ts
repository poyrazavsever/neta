import "server-only";

import { z } from "zod";
import { DomainError } from "@/server/domain/errors";

export async function parseApiV1Json<T>(
  request: Request,
  schema: z.ZodType<T>,
  maxBytes?: number,
): Promise<T> {
  let body: unknown;
  try {
    if (maxBytes === undefined) body = await request.json();
    else {
      const reader = request.body?.getReader();
      if (!reader) throw new DomainError("VALIDATION_ERROR", "Request body must be valid JSON.");
      const chunks: Uint8Array[] = []; let bytes = 0;
      try {
        while (true) {
          const part = await reader.read(); if (part.done) break;
          bytes += part.value.byteLength;
          if (bytes > maxBytes) { await reader.cancel(); throw new DomainError("VALIDATION_ERROR", "Request body exceeds its size limit."); }
          chunks.push(part.value);
        }
      } finally { reader.releaseLock(); }
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    }
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError("VALIDATION_ERROR", "Request body must be valid JSON.", {
      messageKey: "validation.invalidJson",
    });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    throw new DomainError("VALIDATION_ERROR", "Invalid request payload.", {
      fieldErrors: flattened.fieldErrors,
      messageKey: "validation.required",
    });
  }

  return parsed.data;
}
