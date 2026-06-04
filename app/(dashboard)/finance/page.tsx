import {
  FinanceClient,
  type FinanceRelationOption,
  type FinanceTransactionItem,
} from "@/app/(dashboard)/finance/finance-client";
import { createClient } from "@/lib/supabase/server";

type FinanceRow = {
  id: string;
  type: "income" | "expense";
  amount: number | string;
  currency: string;
  transaction_date: string;
  category: string | null;
  payment_status: "planned" | "pending" | "paid" | "cancelled";
  client_id: string | null;
  project_id: string | null;
  description: string | null;
  clients: { name: string } | { name: string }[] | null;
  projects: { name: string } | { name: string }[] | null;
};

export default async function FinancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: financeRows }, { data: clientRows }, { data: projectRows }] =
    await Promise.all([
      supabase
        .from("finance_transactions")
        .select("id, type, amount, currency, transaction_date, category, payment_status, client_id, project_id, description, clients(name), projects(name)")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false }),
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

  const transactions: FinanceTransactionItem[] = ((financeRows || []) as unknown as FinanceRow[]).map((transaction) => ({
    id: transaction.id,
    type: normalizeType(transaction.type),
    amount: Number(transaction.amount),
    currency: transaction.currency,
    transaction_date: transaction.transaction_date,
    category: transaction.category,
    payment_status: normalizePaymentStatus(transaction.payment_status),
    client_id: transaction.client_id,
    project_id: transaction.project_id,
    clientName: getRelationName(transaction.clients),
    projectName: getRelationName(transaction.projects),
    description: transaction.description,
  }));

  return (
    <FinanceClient
      transactions={transactions}
      clients={(clientRows || []) as FinanceRelationOption[]}
      projects={(projectRows || []) as FinanceRelationOption[]}
    />
  );
}

function getRelationName(relation: FinanceRow["clients"] | FinanceRow["projects"]) {
  if (!relation) return null;
  return Array.isArray(relation) ? relation[0]?.name || null : relation.name;
}

function normalizeType(type: string): FinanceTransactionItem["type"] {
  return type === "income" ? "income" : "expense";
}

function normalizePaymentStatus(status: string): FinanceTransactionItem["payment_status"] {
  if (status === "pending" || status === "paid" || status === "cancelled") {
    return status;
  }

  return "planned";
}
