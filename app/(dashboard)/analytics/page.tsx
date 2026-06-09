import { createClient } from "@/lib/supabase/server";
import { AnalyticsClient } from "./analytics-client";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Analizler - Neta",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*");

  // 2. Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*");

  // 3. Fetch finances
  const { data: finances } = await supabase
    .from("finance_transactions")
    .select("*");

  const analyticsData = {
    tasks: tasks || [],
    projects: projects || [],
    finances: finances || [],
  };

  return <AnalyticsClient data={analyticsData} />;
}
