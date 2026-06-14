import { createClient } from "@/lib/supabase/server";

type FirstAdminSetupState = {
  available: boolean;
  errorMessage?: string;
};

function isMissingSetupFunctionError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "PGRST202" ||
    error.message?.includes("is_first_admin_setup_available")
  );
}

async function getSetupStateFromProfiles(): Promise<FirstAdminSetupState | null> {
  const supabaseUrl =
    process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const endpoint = new URL("/rest/v1/profiles", supabaseUrl);
  endpoint.searchParams.set("select", "id");
  endpoint.searchParams.set("limit", "1");

  try {
    const response = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!response.ok) {
      console.error("First admin setup fallback check failed", {
        status: response.status,
        body: await response.text(),
      });
      return null;
    }

    const rows = (await response.json()) as Array<{ id: string }>;
    return { available: rows.length === 0 };
  } catch (error) {
    console.error("First admin setup fallback request failed", error);
    return null;
  }
}

export async function getFirstAdminSetupState(): Promise<FirstAdminSetupState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_first_admin_setup_available");

  if (error) {
    console.error("First admin setup check failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    const fallbackState = await getSetupStateFromProfiles();

    if (fallbackState) {
      if (isMissingSetupFunctionError(error)) {
        console.warn(
          "First admin setup RPC is not available through PostgREST yet; using service-role profile fallback.",
        );
      }

      return fallbackState;
    }

    return {
      available: false,
      errorMessage:
        "İlk kurulum kontrolü yapılamadı. Veritabanı hazırlık servisi henüz tamamlanmamış olabilir; birkaç saniye sonra tekrar deneyin.",
    };
  }

  return { available: Boolean(data) };
}
