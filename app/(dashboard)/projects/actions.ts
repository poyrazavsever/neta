"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

const PROJECT_TYPES = ["client_project", "side_project"] as const;
const PROJECT_STATUSES = ["planning", "active", "paused", "completed", "cancelled"] as const;
const PLANNING_SECTION_CATEGORIES = [
  "overview",
  "problem",
  "goal",
  "audience",
  "scope",
  "design_system",
  "color_palette",
  "typography",
  "assets",
  "notes",
] as const;
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

function readPlanningSectionCategory(value: FormDataEntryValue | null) {
  const category = typeof value === "string" ? value : "overview";
  return PLANNING_SECTION_CATEGORIES.includes(
    category as (typeof PLANNING_SECTION_CATEGORIES)[number],
  )
    ? category
    : "overview";
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
  userId,
  projectId,
  formData,
}: {
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
  const admin = createServiceRoleClient();
  const { error } = await admin.storage
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
  revalidatePath(`/projects/${id}`);
}

function readPlanningSectionPayload(formData: FormData) {
  return {
    project_id: cleanText(formData.get("project_id")),
    category: readPlanningSectionCategory(formData.get("category")),
    title: cleanText(formData.get("title")),
    content: cleanText(formData.get("content")),
    sort_order: Math.round(readNumber(formData.get("sort_order")) ?? 0),
  };
}

export async function createProjectPlanningSectionRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const payload = readPlanningSectionPayload(formData);

  if (!payload.project_id || !payload.title) {
    throw new Error("Planlama alanı eklemek için proje ve başlık zorunludur.");
  }

  const { error } = await supabase.from("project_planning_sections").insert({
    user_id: userId,
    project_id: payload.project_id,
    category: payload.category,
    title: payload.title,
    content: payload.content,
    sort_order: payload.sort_order,
  });

  if (error) {
    throw new Error(`Planlama alanı eklenemedi: ${error.message}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${payload.project_id}`);
}

export async function updateProjectPlanningSectionRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const payload = readPlanningSectionPayload(formData);

  if (!id || !payload.project_id || !payload.title) {
    throw new Error("Planlama alanını güncellemek için kayıt kimliği, proje ve başlık zorunludur.");
  }

  const { error } = await supabase
    .from("project_planning_sections")
    .update({
      category: payload.category,
      title: payload.title,
      content: payload.content,
      sort_order: payload.sort_order,
    })
    .eq("id", id)
    .eq("project_id", payload.project_id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Planlama alanı güncellenemedi: ${error.message}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${payload.project_id}`);
}

export async function deleteProjectPlanningSectionRecord(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();
  const id = cleanText(formData.get("id"));
  const projectId = cleanText(formData.get("project_id"));

  if (!id || !projectId) {
    throw new Error("Silinecek planlama alanı bulunamadı.");
  }

  const { error } = await supabase
    .from("project_planning_sections")
    .delete()
    .eq("id", id)
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Planlama alanı silinemedi: ${error.message}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function updateRevisionStatus(id: string, projectId: string, status: string) {
  const { supabase } = await getCurrentUserId();
  
  const { error } = await supabase
    .from("project_revisions")
    .update({ status })
    .eq("id", id)
    .eq("project_id", projectId);

  if (error) {
    throw new Error(`Revizyon durumu güncellenemedi: ${error.message}`);
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectSettings(projectId: string, progressType: "manual" | "auto", progress: number, revisionQuota: number) {
  const { supabase, userId } = await getCurrentUserId();

  if (!projectId) {
    throw new Error("Proje ID zorunludur.");
  }

  const { error } = await supabase
    .from("projects")
    .update({ 
      progress_type: progressType, 
      progress: progress, 
      revision_quota: revisionQuota 
    })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Ayarlar güncellenemedi: ${error.message}`);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}
