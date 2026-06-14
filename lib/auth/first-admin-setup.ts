import { createClient } from "@/lib/supabase/server";

type FirstAdminSetupState = {
  available: boolean;
  errorMessage?: string;
};

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

    const missingMigration =
      error.code === "PGRST202" ||
      error.message?.includes("is_first_admin_setup_available");

    return {
      available: false,
      errorMessage: missingMigration
        ? "İlk kurulum kontrolü yapılamadı. 0009 kayıt kilidi migration dosyasını uygulamanın bağlı olduğu Supabase projesinde çalıştırdığından emin ol."
        : "İlk kurulum kontrolü yapılamadı. Supabase bağlantısını ve sunucu loglarını kontrol et.",
    };
  }

  return { available: Boolean(data) };
}
