"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CLIENT_STATUSES = ["active", "paused", "archived"] as const;

function cleanText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function readStatus(value: FormDataEntryValue | null) {
  const status = typeof value === "string" ? value : "active";
  return CLIENT_STATUSES.includes(status as (typeof CLIENT_STATUSES)[number])
    ? status
    : "active";
}

function cleanWebsite(value: FormDataEntryValue | null) {
  const website = cleanText(value)?.replace(/\s/g, "") || null;

  if (!website) {
    return null;
  }

  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Müşteri işlemi için giriş yapmış kullanıcı bulunamadı.");
  }

  return { supabase, userId: user.id };
}

export async function createClientRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const name = cleanText(formData.get("name"));

  if (!name) {
    throw new Error("Müşteri adı zorunludur.");
  }

  const { error } = await supabase.from("clients").insert({
    user_id: userId,
    name,
    company_name: cleanText(formData.get("company_name")),
    email: cleanText(formData.get("email")),
    phone: cleanText(formData.get("phone")),
    website: cleanWebsite(formData.get("website")),
    status: readStatus(formData.get("status")),
    notes: cleanText(formData.get("notes")),
    pipeline_stage: formData.get("pipeline_stage") ? String(formData.get("pipeline_stage")) : "lead",
    next_follow_up_date: cleanText(formData.get("next_follow_up_date")) || null,
  });

  if (error) {
    throw new Error(`Müşteri eklenemedi: ${error.message}`);
  }

  revalidatePath("/clients");
}

export async function updateClientRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const name = cleanText(formData.get("name"));

  if (!id || !name) {
    throw new Error("Müşteri güncellemek için müşteri adı ve kayıt kimliği zorunludur.");
  }

  const { error } = await supabase
    .from("clients")
    .update({
      name,
      company_name: cleanText(formData.get("company_name")),
      email: cleanText(formData.get("email")),
      phone: cleanText(formData.get("phone")),
      website: cleanWebsite(formData.get("website")),
      status: readStatus(formData.get("status")),
      notes: cleanText(formData.get("notes")),
      pipeline_stage: formData.get("pipeline_stage") ? String(formData.get("pipeline_stage")) : "lead",
      next_follow_up_date: cleanText(formData.get("next_follow_up_date")) || null,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Müşteri güncellenemedi: ${error.message}`);
  }

  revalidatePath("/clients");
}

export async function archiveClientRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("Arşivlenecek müşteri bulunamadı.");
  }

  const { error } = await supabase
    .from("clients")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Müşteri arşivlenemedi: ${error.message}`);
  }

  revalidatePath("/clients");
}

export async function updateClientPipelineStage(id: string, stage: string) {
  const { supabase, userId } = await getCurrentUserId();

  if (!id || !stage) {
    throw new Error("Eksik bilgi.");
  }

  const { error } = await supabase
    .from("clients")
    .update({ pipeline_stage: stage })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Aşama güncellenemedi: ${error.message}`);
  }

  revalidatePath("/clients");
}
