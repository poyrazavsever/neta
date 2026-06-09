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

  // 1. Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .or(`due_at.gte.${thirtyDaysAgoStr},created_at.gte.${thirtyDaysAgoStr}`)
    .order("due_at", { ascending: true });

  // 2. Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  // 3. Fetch finances
  const { data: finances } = await supabase
    .from("finance_transactions")
    .select("*")
    .gte("transaction_date", thirtyDaysAgoStr)
    .order("transaction_date", { ascending: true });

  // 4. Fetch daily logs
  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .gte("log_date", thirtyDaysAgoStr)
    .order("log_date", { ascending: true });

  // 5. Fetch recent clients
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const dashboardData = {
    tasks: tasks || [],
    projects: projects || [],
    finances: finances || [],
    logs: logs || [],
    clients: clients || [],
  };

  return <DashboardClient data={dashboardData} />;
}
