import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard - Neta",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current date and date 30 days ago
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const todayStr = today.toISOString();
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

  // Fetch all dashboard data in parallel with only needed columns
  const [
    { data: tasks },
    { data: projects },
    { data: finances },
    { data: logs },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, status, created_at, updated_at, due_at")
      .or(`due_at.gte.${thirtyDaysAgoStr},created_at.gte.${thirtyDaysAgoStr}`)
      .order("due_at", { ascending: true }),
    supabase
      .from("projects")
      .select("id, status, name, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("finance_transactions")
      .select("id, type, amount, transaction_date")
      .gte("transaction_date", thirtyDaysAgoStr)
      .order("transaction_date", { ascending: true }),
    supabase
      .from("daily_logs")
      .select("id, log_date, mood_score, energy_score")
      .gte("log_date", thirtyDaysAgoStr)
      .order("log_date", { ascending: true }),
    supabase
      .from("clients")
      .select("id, name, company_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const dashboardData = {
    tasks: tasks || [],
    projects: projects || [],
    finances: finances || [],
    logs: logs || [],
    clients: clients || [],
  };

  return <DashboardClient data={dashboardData} />;
}
