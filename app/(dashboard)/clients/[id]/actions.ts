"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function cleanText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

export async function addClientActivity(clientId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const title = cleanText(formData.get("title"));
  if (!title) {
    throw new Error("Aktivite başlığı zorunludur.");
  }

  const { error } = await supabase.from("client_activities").insert({
    user_id: user.id,
    client_id: clientId,
    type: formData.get("type") as string || "note",
    title,
    content: cleanText(formData.get("content")),
    activity_date: formData.get("activity_date") as string || new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Aktivite eklenemedi: ${error.message}`);
  }

  // Update client's last_contact_date
  await supabase
    .from("clients")
    .update({ last_contact_date: new Date().toISOString() })
    .eq("id", clientId)
    .eq("user_id", user.id);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients`);
}
