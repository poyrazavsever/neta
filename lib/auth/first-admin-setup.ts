import { createClient } from "@/lib/supabase/server";

type FirstAdminSetupState = {
  available: boolean;
  errorMessage?: string;
};

export async function getFirstAdminSetupState(): Promise<FirstAdminSetupState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_first_admin_setup_available");

  if (error) {
    return {
      available: false,
      errorMessage:
        "İlk kurulum kontrolü yapılamadı. 0009 kayıt kilidi migration dosyasını çalıştırdığından emin ol.",
    };
  }

  return { available: Boolean(data) };
}
