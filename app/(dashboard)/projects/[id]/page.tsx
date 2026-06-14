import {
  ProjectDetailClient,
  type ProjectDetail,
  type ProjectDetailTaskItem,
  type ProjectFinanceItem,
  type ProjectPlanningSectionItem,
} from "@/app/(dashboard)/projects/[id]/project-detail-client";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type ProjectRow = {
  id: string;
  client_id: string | null;
  name: string;
  type: "client_project" | "side_project";
  description: string | null;
  status: "planning" | "active" | "paused" | "completed" | "cancelled";
  start_date: string | null;
  due_date: string | null;
  budget_amount: number | string | null;
  currency: string;
  progress: number;
  progress_type: "manual" | "auto" | null;
  revision_quota: number | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  clients: { name: string } | { name: string }[] | null;
};

type SectionRow = ProjectPlanningSectionItem;

type TaskRow = {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  due_at: string | null;
  is_public_to_client: boolean | null;
};

type FinanceRow = {
  id: string;
  type: string;
  amount: number | string;
  currency: string;
  payment_status: string;
  transaction_date: string;
  category: string | null;
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: projectRow }, { data: sectionRows }, { data: taskRows }, { data: financeRows }, { data: revisionRows }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, client_id, name, type, description, status, start_date, due_date, budget_amount, currency, progress, progress_type, revision_quota, cover_image_path, cover_image_alt, clients(name)",
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("project_planning_sections")
        .select("id, project_id, category, title, content, sort_order")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("tasks")
        .select("id, title, status, priority, due_at, is_public_to_client")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("finance_transactions")
        .select("id, type, amount, currency, payment_status, transaction_date, category")
        .eq("project_id", id)
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false }),
      supabase
        .from("project_revisions")
        .select("id, description, status, created_at, requested_by")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!projectRow) {
    notFound();
  }

  const projectData = projectRow as unknown as ProjectRow;
  const coverImageUrl = projectData.cover_image_path
    ? await createProjectImageUrl(projectData.cover_image_path)
    : null;

  const project: ProjectDetail = {
    id: projectData.id,
    client_id: projectData.client_id,
    clientName: getClientName(projectData.clients),
    name: projectData.name,
    type: normalizeProjectType(projectData.type),
    description: projectData.description,
    status: normalizeProjectStatus(projectData.status),
    start_date: projectData.start_date,
    due_date: projectData.due_date,
    budget_amount:
      projectData.budget_amount === null ? null : Number(projectData.budget_amount),
    currency: projectData.currency,
    progress: Number(projectData.progress || 0),
    progress_type: projectData.progress_type === "auto" ? "auto" : "manual",
    revision_quota: Number(projectData.revision_quota || 0),
    cover_image_alt: projectData.cover_image_alt,
    coverImageUrl,
  };

  const sections = ((sectionRows || []) as unknown as SectionRow[]).map((section) => ({
    ...section,
    category: normalizeSectionCategory(section.category),
    sort_order: Number(section.sort_order || 0),
  }));
  const tasks: ProjectDetailTaskItem[] = ((taskRows || []) as TaskRow[]).map((task) => ({
    id: task.id,
    title: task.title,
    status: normalizeTaskStatus(task.status),
    priority: normalizeTaskPriority(task.priority),
    due_at: task.due_at,
    is_public_to_client: task.is_public_to_client || false,
  }));
  const revisions = revisionRows || [];
  const financeTransactions: ProjectFinanceItem[] = ((financeRows || []) as FinanceRow[]).map(
    (transaction) => ({
      id: transaction.id,
      type: transaction.type === "income" ? "income" : "expense",
      amount: Number(transaction.amount || 0),
      currency: transaction.currency,
      payment_status: normalizePaymentStatus(transaction.payment_status),
      transaction_date: transaction.transaction_date,
      category: transaction.category,
    }),
  );

  return (
    <ProjectDetailClient
      project={project}
      sections={sections}
      tasks={tasks}
      financeTransactions={financeTransactions}
      revisions={revisions}
    />
  );
}

async function createProjectImageUrl(path: string) {
  const admin = createServiceRoleClient();
  const { data } = await admin.storage
    .from("project-assets")
    .createSignedUrl(path, 60 * 15);

  return data?.signedUrl || null;
}

function getClientName(client: ProjectRow["clients"]) {
  if (!client) return null;
  return Array.isArray(client) ? client[0]?.name || null : client.name;
}

function normalizeProjectType(type: string): ProjectDetail["type"] {
  return type === "side_project" ? "side_project" : "client_project";
}

function normalizeProjectStatus(status: string): ProjectDetail["status"] {
  if (
    status === "active" ||
    status === "paused" ||
    status === "completed" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "planning";
}

function normalizeSectionCategory(category: string): ProjectPlanningSectionItem["category"] {
  if (
    category === "problem" ||
    category === "goal" ||
    category === "audience" ||
    category === "scope" ||
    category === "design_system" ||
    category === "color_palette" ||
    category === "typography" ||
    category === "assets" ||
    category === "notes"
  ) {
    return category;
  }

  return "overview";
}

function normalizeTaskStatus(status: string | null): ProjectDetailTaskItem["status"] {
  if (status === "in_progress" || status === "done") {
    return status;
  }

  return "todo";
}

function normalizeTaskPriority(priority: string | null): ProjectDetailTaskItem["priority"] {
  if (priority === "low" || priority === "high" || priority === "urgent") {
    return priority;
  }

  return "medium";
}

function normalizePaymentStatus(status: string): ProjectFinanceItem["payment_status"] {
  if (status === "pending" || status === "paid" || status === "cancelled") {
    return status;
  }

  return "planned";
}
