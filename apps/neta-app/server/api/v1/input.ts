import "server-only";

import { z } from "zod";
import { DomainError } from "@/server/domain/errors";

export async function parseApiV1Json<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
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
