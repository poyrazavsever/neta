import {
  ProjectsClient,
  type ProjectClientOption,
  type ProjectListItem,
} from "@/app/(dashboard)/projects/projects-client";
import { createClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  user_id: string;
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
  cover_image_path: string | null;
  cover_image_alt: string | null;
  clients: { name: string } | { name: string }[] | null;
};

type TaskRow = {
  project_id: string | null;
  status: string | null;
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: projectRows }, { data: clientRows }, { data: taskRows }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, user_id, client_id, name, type, description, status, start_date, due_date, budget_amount, currency, progress, cover_image_path, cover_image_alt, clients(name)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("name", { ascending: true }),
      supabase.from("tasks").select("project_id, status").eq("user_id", user.id),
    ]);

  const taskStats = countTasksByProject((taskRows || []) as TaskRow[]);
  const clients = (clientRows || []) as ProjectClientOption[];
  const signedUrls = await createProjectImageUrls(
    supabase,
    ((projectRows || []) as unknown as ProjectRow[])
      .map((project) => project.cover_image_path)
      .filter(Boolean) as string[],
  );

  const projects: ProjectListItem[] = ((projectRows || []) as unknown as ProjectRow[]).map((project) => {
    const stats = taskStats.get(project.id) || { total: 0, done: 0 };

    return {
      id: project.id,
      client_id: project.client_id,
      clientName: getClientName(project.clients),
      name: project.name,
      type: project.type,
      description: project.description,
      status: project.status,
      start_date: project.start_date,
      due_date: project.due_date,
      budget_amount: project.budget_amount === null ? null : Number(project.budget_amount),
      currency: project.currency,
      progress: project.progress,
      cover_image_path: project.cover_image_path,
      cover_image_alt: project.cover_image_alt,
      coverImageUrl: project.cover_image_path ? signedUrls.get(project.cover_image_path) || null : null,
      taskCount: stats.total,
      doneTaskCount: stats.done,
    };
  });

  return <ProjectsClient projects={projects} clients={clients} />;
}

async function createProjectImageUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: string[],
) {
  const urls = new Map<string, string>();
  const uniquePaths = Array.from(new Set(paths));

  await Promise.all(
    uniquePaths.map(async (path) => {
      const { data } = await supabase.storage
        .from("project-assets")
        .createSignedUrl(path, 60 * 15);

      if (data?.signedUrl) {
        urls.set(path, data.signedUrl);
      }
    }),
  );

  return urls;
}

function getClientName(client: ProjectRow["clients"]) {
  if (!client) return null;
  return Array.isArray(client) ? client[0]?.name || null : client.name;
}

function countTasksByProject(tasks: TaskRow[]) {
  const statsByProject = new Map<string, { total: number; done: number }>();

  for (const task of tasks) {
    if (!task.project_id) continue;

    const current = statsByProject.get(task.project_id) || { total: 0, done: 0 };
    current.total += 1;

    if (task.status === "done") {
      current.done += 1;
    }

    statsByProject.set(task.project_id, current);
  }

  return statsByProject;
}
