import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard - Neta",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const range = typeof searchParams.range === "string" ? searchParams.range : "this_month";
  
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // default to end of month
  
  if (range === "today") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else if (range === "this_week") {
    // Reset `now` because setDate mutates
    const tempNow = new Date();
    const firstDay = new Date(tempNow.setDate(tempNow.getDate() - tempNow.getDay() + (tempNow.getDay() === 0 ? -6 : 1)));
    firstDay.setHours(0, 0, 0, 0);
    startDate = firstDay;
    endDate = new Date(firstDay.getTime());
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (range === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (range === "this_year") {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }

  // Fetch metrics using RPC
  const { data: metricsData } = await supabase.rpc('get_dashboard_metrics', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString()
  });

  // Fetch limited recent data
  const [
    { data: projects },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, status, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("clients")
      .select("id, name, company_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const dashboardData = {
    metrics: metricsData || {
      netProfit: 0,
      activeProjectsCount: 0,
      completedTasksCount: 0,
      avgMood: "0.0",
      financeTrend: [],
      moodTrend: []
    },
    projects: projects || [],
    clients: clients || [],
    range
  };

  return <DashboardClient data={dashboardData} />;
}
