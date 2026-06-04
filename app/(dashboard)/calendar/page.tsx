import {
  CalendarClient,
  type CalendarEventItem,
  type CalendarRelationOption,
  type CalendarTaskOption,
} from "@/app/(dashboard)/calendar/calendar-client";
import { createClient } from "@/lib/supabase/server";

type CalendarEventRow = {
  id: string;
  title: string;
  description: string | null;
  type: CalendarEventItem["type"];
  starts_at: string;
  ends_at: string | null;
  client_id: string | null;
  project_id: string | null;
  task_id: string | null;
  clients: { name: string } | { name: string }[] | null;
  projects: { name: string } | { name: string }[] | null;
  tasks: { title: string } | { title: string }[] | null;
};

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: eventRows }, { data: clientRows }, { data: projectRows }, { data: taskRows }] =
    await Promise.all([
      supabase
        .from("calendar_events")
        .select("id, title, description, type, starts_at, ends_at, client_id, project_id, task_id, clients(name), projects(name), tasks(title)")
        .eq("user_id", user.id)
        .order("starts_at", { ascending: true }),
      supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id)
        .neq("status", "archived")
        .order("name", { ascending: true }),
      supabase
        .from("projects")
        .select("id, name")
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .order("name", { ascending: true }),
      supabase
        .from("tasks")
        .select("id, title")
        .eq("user_id", user.id)
        .neq("status", "done")
        .order("created_at", { ascending: false }),
    ]);

  const events: CalendarEventItem[] = ((eventRows || []) as unknown as CalendarEventRow[]).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    type: normalizeType(event.type),
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    client_id: event.client_id,
    project_id: event.project_id,
    task_id: event.task_id,
    clientName: getRelationName(event.clients),
    projectName: getRelationName(event.projects),
    taskTitle: getRelationTitle(event.tasks),
  }));

  return (
    <CalendarClient
      events={events}
      clients={(clientRows || []) as CalendarRelationOption[]}
      projects={(projectRows || []) as CalendarRelationOption[]}
      tasks={(taskRows || []) as CalendarTaskOption[]}
    />
  );
}

function getRelationName(relation: CalendarEventRow["clients"] | CalendarEventRow["projects"]) {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0]?.name || null : relation.name;
}

function getRelationTitle(relation: CalendarEventRow["tasks"]) {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0]?.title || null : relation.title;
}

function normalizeType(type: string): CalendarEventItem["type"] {
  if (
    type === "meeting" ||
    type === "deadline" ||
    type === "personal" ||
    type === "finance"
  ) {
    return type;
  }

  return "focus";
}
