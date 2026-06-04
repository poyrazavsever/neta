"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function cleanText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function readScore(value: FormDataEntryValue | null) {
  const score = Number(typeof value === "string" ? value : value?.toString());
  return Number.isInteger(score) && score >= 1 && score <= 5 ? score : null;
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Günlük kaydı için giriş yapmış kullanıcı bulunamadı.");
  }

  return { supabase, userId: user.id };
}

function readPayload(formData: FormData) {
  return {
    log_date: cleanText(formData.get("log_date")) || new Date().toISOString().slice(0, 10),
    mood_score: readScore(formData.get("mood_score")),
    energy_score: readScore(formData.get("energy_score")),
    work_satisfaction_score: readScore(formData.get("work_satisfaction_score")),
    note: cleanText(formData.get("note")),
  };
}

export async function createDailyLogRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const payload = readPayload(formData);

  if (!payload.mood_score || !payload.energy_score) {
    throw new Error("Mood ve enerji skorları zorunludur.");
  }

  const { error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: userId,
        ...payload,
      },
      { onConflict: "user_id,log_date" },
    );

  if (error) {
    throw new Error(`Günlük kaydı eklenemedi: ${error.message}`);
  }

  revalidatePath("/journal");
}

export async function updateDailyLogRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const payload = readPayload(formData);

  if (!id || !payload.mood_score || !payload.energy_score) {
    throw new Error("Günlük kaydını güncellemek için kayıt kimliği, mood ve enerji skorları zorunludur.");
  }

  const { error } = await supabase
    .from("daily_logs")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Günlük kaydı güncellenemedi: ${error.message}`);
  }

  revalidatePath("/journal");
}

export async function deleteDailyLogRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("Silinecek günlük kaydı bulunamadı.");
  }

  const { error } = await supabase
    .from("daily_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Günlük kaydı silinemedi: ${error.message}`);
  }

  revalidatePath("/journal");
}
