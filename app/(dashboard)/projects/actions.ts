"use server";

import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const PROJECT_TYPES = ["client_project", "side_project"] as const;
const PROJECT_STATUSES = ["planning", "active", "paused", "completed", "cancelled"] as const;
const PROJECT_ASSETS_BUCKET = "project-assets";

function cleanText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function readProjectType(value: FormDataEntryValue | null) {
  const type = typeof value === "string" ? value : "client_project";
  return PROJECT_TYPES.includes(type as (typeof PROJECT_TYPES)[number])
    ? type
    : "client_project";
}

function readProjectStatus(value: FormDataEntryValue | null) {
  const status = typeof value === "string" ? value : "planning";
  return PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])
    ? status
    : "planning";
}

function readNumber(value: FormDataEntryValue | null) {
  const number = Number(typeof value === "string" ? value.replace(",", ".") : value);
  return Number.isFinite(number) ? number : null;
}

function readProgress(value: FormDataEntryValue | null) {
  const progress = Math.round(readNumber(value) ?? 0);
  return Math.min(Math.max(progress, 0), 100);
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Proje işlemi için giriş yapmış kullanıcı bulunamadı.");
  }

  return { supabase, userId: user.id };
}

function readPayload(formData: FormData) {
  const type = readProjectType(formData.get("type"));
  const clientId = cleanText(formData.get("client_id"));

  return {
    name: cleanText(formData.get("name")),
    type,
    client_id: type === "client_project" ? clientId : null,
    description: cleanText(formData.get("description")),
    status: readProjectStatus(formData.get("status")),
    start_date: cleanText(formData.get("start_date")),
    due_date: cleanText(formData.get("due_date")),
    budget_amount: readNumber(formData.get("budget_amount")),
    currency: cleanText(formData.get("currency")) || "USD",
    progress: readProgress(formData.get("progress")),
    cover_image_alt: cleanText(formData.get("cover_image_alt")),
  };
}

function readImageFile(formData: FormData) {
  const file = formData.get("cover_image");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Kapak görseli bir görsel dosyası olmalıdır.");
  }

  return file;
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function uploadCoverImage({
  supabase,
  userId,
  projectId,
  formData,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  projectId: string;
  formData: FormData;
}) {
  const file = readImageFile(formData);

  if (!file) {
    return null;
  }

  const fileName = `${Date.now()}-${sanitizeFileName(file.name) || "cover-image"}`;
  const path = `${userId}/projects/${projectId}/${fileName}`;
  const { error } = await supabase.storage
    .from(PROJECT_ASSETS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Kapak görseli yüklenemedi: ${error.message}`);
  }

  return path;
}

export async function createProjectRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const projectId = randomUUID();
  const payload = readPayload(formData);

  if (!payload.name) {
    throw new Error("Proje adı zorunludur.");
  }

  const coverImagePath = await uploadCoverImage({
    supabase,
    userId,
    projectId,
    formData,
  });

  const { error } = await supabase.from("projects").insert({
    id: projectId,
    user_id: userId,
    ...payload,
    cover_image_path: coverImagePath,
  });

  if (error) {
    throw new Error(`Proje eklenemedi: ${error.message}`);
  }

  revalidatePath("/projects");
}

export async function updateProjectRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const payload = readPayload(formData);

  if (!id || !payload.name) {
    throw new Error("Proje güncellemek için proje adı ve kayıt kimliği zorunludur.");
  }

  const coverImagePath = await uploadCoverImage({
    supabase,
    userId,
    projectId: id,
    formData,
  });

  const updatePayload = {
    ...payload,
    ...(coverImagePath ? { cover_image_path: coverImagePath } : {}),
  };

  const { error } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Proje güncellenemedi: ${error.message}`);
  }

  revalidatePath("/projects");
}

export async function completeProjectRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("Tamamlanacak proje bulunamadı.");
  }

  const { error } = await supabase
    .from("projects")
    .update({ status: "completed", progress: 100 })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Proje tamamlanamadı: ${error.message}`);
  }

  revalidatePath("/projects");
}
