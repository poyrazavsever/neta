"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createRevisionRequest(projectId: string, clientId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Oturum süresi dolmuş." };
  }

  const description = formData.get("description") as string;

  if (!description?.trim()) {
    return { error: "Revizyon açıklaması boş olamaz." };
  }

  const { error } = await supabase
    .from("project_revisions")
    .insert({
      project_id: projectId,
      client_id: clientId,
      requested_by: user.id,
      description,
      status: "pending"
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/portal/projects/${projectId}`);
  return { success: true };
}
