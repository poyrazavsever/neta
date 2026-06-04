import {
  TasksClient,
  type TaskListItem,
  type TaskRelationOption,
} from "@/app/(dashboard)/tasks/tasks-client";
import { createClient } from "@/lib/supabase/server";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  due_at: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  client_id: string | null;
  project_id: string | null;
  created_at: string;
  clients: { name: string } | { name: string }[] | null;
  projects: { name: string } | { name: string }[] | null;
};

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: taskRows }, { data: clientRows }, { data: projectRows }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, title, description, status, priority, due_at, estimated_minutes, actual_minutes, client_id, project_id, created_at, clients(name), projects(name)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("name", { ascending: true }),
      supabase
        .from("projects")
        .select("id, name, client_id")
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("name", { ascending: true }),
    ]);

  const clients = (clientRows || []) as TaskRelationOption[];
  const projects = (projectRows || []) as TaskRelationOption[];
  const tasks: TaskListItem[] = ((taskRows || []) as unknown as TaskRow[]).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: normalizeStatus(task.status),
    priority: normalizePriority(task.priority),
    due_at: task.due_at,
    estimated_minutes: task.estimated_minutes,
    actual_minutes: task.actual_minutes,
    client_id: task.client_id,
    clientName: getRelationName(task.clients),
    project_id: task.project_id,
    projectName: getRelationName(task.projects),
    created_at: task.created_at,
  }));

  return <TasksClient tasks={tasks} clients={clients} projects={projects} />;
}

function getRelationName(relation: TaskRow["clients"] | TaskRow["projects"]) {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0]?.name || null : relation.name;
}

function normalizeStatus(status: string): TaskListItem["status"] {
  return status === "in_progress" || status === "done" ? status : "todo";
}

function normalizePriority(priority: string): TaskListItem["priority"] {
  if (priority === "low" || priority === "high" || priority === "urgent") {
    return priority;
  }

  return "medium";
}
