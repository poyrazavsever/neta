import { createClient } from "@/lib/supabase/server";
import { ClientDetailClient, type ClientDetailData, type ClientActivity } from "./client-detail-client";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: clientData, error } = await supabase
    .from("clients")
    .select("id, name, company_name, email, phone, website, pipeline_stage, status, notes, client_auth_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !clientData) {
    notFound();
  }

  const { data: activitiesData } = await supabase
    .from("client_activities")
    .select("id, type, title, content, activity_date, created_at")
    .eq("client_id", id)
    .eq("user_id", user.id)
    .order("activity_date", { ascending: false });

  const client: ClientDetailData = clientData as ClientDetailData;
  const activities: ClientActivity[] = (activitiesData || []) as ClientActivity[];

  return <ClientDetailClient client={client} activities={activities} />;
}
