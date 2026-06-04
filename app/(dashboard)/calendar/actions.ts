"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const EVENT_TYPES = ["meeting", "focus", "deadline", "personal", "finance"] as const;

function cleanText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 && text !== "__none" ? text : null;
}

function readType(value: FormDataEntryValue | null) {
  const type = typeof value === "string" ? value : "focus";
  return EVENT_TYPES.includes(type as (typeof EVENT_TYPES)[number]) ? type : "focus";
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Takvim işlemi için giriş yapmış kullanıcı bulunamadı.");
  }

  return { supabase, userId: user.id };
}

function readPayload(formData: FormData) {
  return {
    title: cleanText(formData.get("title")),
    description: cleanText(formData.get("description")),
    type: readType(formData.get("type")),
    starts_at: cleanText(formData.get("starts_at")),
    ends_at: cleanText(formData.get("ends_at")),
    client_id: cleanText(formData.get("client_id")),
    project_id: cleanText(formData.get("project_id")),
    task_id: cleanText(formData.get("task_id")),
  };
}

export async function createCalendarEventRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const payload = readPayload(formData);

  if (!payload.title || !payload.starts_at) {
    throw new Error("Etkinlik başlığı ve başlangıç zamanı zorunludur.");
  }

  const { error } = await supabase.from("calendar_events").insert({
    user_id: userId,
    ...payload,
  });

  if (error) {
    throw new Error(`Etkinlik eklenemedi: ${error.message}`);
  }

  revalidatePath("/calendar");
}

export async function updateCalendarEventRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const payload = readPayload(formData);

  if (!id || !payload.title || !payload.starts_at) {
    throw new Error("Etkinlik güncellemek için başlık, başlangıç ve kayıt kimliği zorunludur.");
  }

  const { error } = await supabase
    .from("calendar_events")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Etkinlik güncellenemedi: ${error.message}`);
  }

  revalidatePath("/calendar");
}

export async function deleteCalendarEventRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("Silinecek etkinlik bulunamadı.");
  }

  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Etkinlik silinemedi: ${error.message}`);
  }

  revalidatePath("/calendar");
}
