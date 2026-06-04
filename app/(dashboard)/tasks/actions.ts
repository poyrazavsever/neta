"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

function cleanText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function cleanRelationId(value: FormDataEntryValue | null) {
  const id = cleanText(value);
  return id && id !== "__none" ? id : null;
}

function readStatus(value: FormDataEntryValue | null) {
  const status = typeof value === "string" ? value : "todo";
  return TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])
    ? status
    : "todo";
}

function readPriority(value: FormDataEntryValue | null) {
  const priority = typeof value === "string" ? value : "medium";
  return TASK_PRIORITIES.includes(priority as (typeof TASK_PRIORITIES)[number])
    ? priority
    : "medium";
}

function readMinutes(value: FormDataEntryValue | null) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Görev işlemi için giriş yapmış kullanıcı bulunamadı.");
  }

  return { supabase, userId: user.id };
}

function readPayload(formData: FormData) {
  return {
    title: cleanText(formData.get("title")),
    description: cleanText(formData.get("description")),
    status: readStatus(formData.get("status")),
    priority: readPriority(formData.get("priority")),
    client_id: cleanRelationId(formData.get("client_id")),
    project_id: cleanRelationId(formData.get("project_id")),
    due_at: cleanText(formData.get("due_at")),
    estimated_minutes: readMinutes(formData.get("estimated_minutes")),
    actual_minutes: readMinutes(formData.get("actual_minutes")),
  };
}

export async function createTaskRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const payload = readPayload(formData);

  if (!payload.title) {
    throw new Error("Görev başlığı zorunludur.");
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: userId,
    date: payload.due_at || new Date().toISOString(),
    ...payload,
  });

  if (error) {
    throw new Error(`Görev eklenemedi: ${error.message}`);
  }

  revalidatePath("/tasks");
}

export async function updateTaskRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const payload = readPayload(formData);

  if (!id || !payload.title) {
    throw new Error("Görev güncellemek için başlık ve kayıt kimliği zorunludur.");
  }

  const { error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Görev güncellenemedi: ${error.message}`);
  }

  revalidatePath("/tasks");
}

export async function completeTaskRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("Tamamlanacak görev bulunamadı.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: "done" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Görev tamamlanamadı: ${error.message}`);
  }

  revalidatePath("/tasks");
}

export async function updateTaskStatusRecord(taskId: string, status: string) {
  const { supabase, userId } = await getCurrentUserId();
  const nextStatus = readStatus(status);

  if (!taskId) {
    throw new Error("Durumu güncellenecek görev bulunamadı.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: nextStatus })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Görev durumu güncellenemedi: ${error.message}`);
  }

  revalidatePath("/tasks");
}

export async function deleteTaskRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("Silinecek görev bulunamadı.");
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Görev silinemedi: ${error.message}`);
  }

  revalidatePath("/tasks");
}
