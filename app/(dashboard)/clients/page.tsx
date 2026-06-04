import { ClientsClient, type ClientListItem } from "@/app/(dashboard)/clients/clients-client";
import { createClient } from "@/lib/supabase/server";

type ClientRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: "active" | "paused" | "archived";
  notes: string | null;
  created_at: string;
};

type ProjectRow = {
  client_id: string | null;
};

type FinanceRow = {
  client_id: string | null;
  amount: number | string;
  type: "income" | "expense";
  payment_status: "planned" | "pending" | "paid" | "cancelled";
};

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: clientRows }, { data: projectRows }, { data: financeRows }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id, name, company_name, email, phone, website, status, notes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("client_id").eq("user_id", user.id),
      supabase
        .from("finance_transactions")
        .select("client_id, amount, type, payment_status")
        .eq("user_id", user.id),
    ]);

  const projectCountByClient = countProjectsByClient((projectRows || []) as ProjectRow[]);
  const revenueByClient = sumRevenueByClient((financeRows || []) as FinanceRow[]);

  const clients: ClientListItem[] = ((clientRows || []) as ClientRow[]).map((client) => ({
    ...client,
    projectCount: projectCountByClient.get(client.id) || 0,
    revenueTotal: revenueByClient.get(client.id) || 0,
  }));

  const activeCount = clients.filter((client) => client.status === "active").length;
  const pausedCount = clients.filter((client) => client.status === "paused").length;
  const archivedCount = clients.filter((client) => client.status === "archived").length;
  const totalRevenue = clients.reduce((sum, client) => sum + client.revenueTotal, 0);

  return (
    <ClientsClient
      clients={clients}
      totalRevenue={totalRevenue}
      activeCount={activeCount}
      pausedCount={pausedCount}
      archivedCount={archivedCount}
    />
  );
}

function countProjectsByClient(projects: ProjectRow[]) {
  const countByClient = new Map<string, number>();

  for (const project of projects) {
    if (!project.client_id) continue;
    countByClient.set(project.client_id, (countByClient.get(project.client_id) || 0) + 1);
  }

  return countByClient;
}

function sumRevenueByClient(transactions: FinanceRow[]) {
  const revenueByClient = new Map<string, number>();

  for (const transaction of transactions) {
    if (
      !transaction.client_id ||
      transaction.type !== "income" ||
      transaction.payment_status !== "paid"
    ) {
      continue;
    }

    revenueByClient.set(
      transaction.client_id,
      (revenueByClient.get(transaction.client_id) || 0) + Number(transaction.amount || 0),
    );
  }

  return revenueByClient;
}
