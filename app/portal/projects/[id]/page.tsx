import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PortalProjectClient } from "./portal-project-client";

export default async function PortalProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Get Client Record
  const { data: clientData } = await supabase
    .from("clients")
    .select("id")
    .eq("client_auth_id", user.id)
    .single();

  if (!clientData) {
    notFound();
  }

  // 2. Get Project
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, description, status, progress, due_date, revision_quota")
    .eq("id", id)
    .eq("client_id", clientData.id)
    .single();

  if (error || !project) {
    notFound();
  }

  // 3. Get Planning Sections (Milestones etc.)
  const { data: sectionsData } = await supabase
    .from("project_planning_sections")
    .select("*")
    .eq("project_id", id)
    .order("order_index", { ascending: true });

  // 4. Get Public Tasks
  const { data: tasksData } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", id)
    .eq("is_public_to_client", true)
    .order("date", { ascending: false });

  // 5. Get Revisions
  const { data: revisionsData } = await supabase
    .from("project_revisions")
    .select("id, description, status, created_at, requested_by")
    .eq("project_id", id)
    .eq("client_id", clientData.id)
    .order("created_at", { ascending: false });

  return (
    <PortalProjectClient
      project={project}
      sections={sectionsData || []}
      tasks={tasksData || []}
      revisions={revisionsData || []}
      clientId={clientData.id}
    />
  );
}
