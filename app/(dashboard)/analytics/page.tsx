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

  // Fetch all analytics data in parallel with only needed columns
  const [{ data: tasks }, { data: projects }, { data: finances }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id, status, created_at, due_at"),
      supabase
        .from("projects")
        .select("id, name"),
      supabase
        .from("finance_transactions")
        .select("id, type, amount, transaction_date, project_id"),
    ]);

  const analyticsData = {
    tasks: tasks || [],
    projects: projects || [],
    finances: finances || [],
  };

  return <AnalyticsClient data={analyticsData} />;
}
