import { createClient } from "@/lib/supabase/server";
import { InvoicesClient, type InvoiceRow } from "./invoices-client";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: invoicesData } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      amount,
      currency,
      status,
      issue_date,
      due_date,
      created_at,
      clients ( name ),
      projects ( name )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const invoices: InvoiceRow[] = (invoicesData || []).map((i: any) => ({
    id: i.id,
    invoice_number: i.invoice_number,
    amount: Number(i.amount),
    currency: i.currency,
    status: i.status,
    issue_date: i.issue_date,
    due_date: i.due_date,
    created_at: i.created_at,
    clientName: i.clients?.name || null,
    projectName: i.projects?.name || null,
  }));

  return <InvoicesClient invoices={invoices} />;
}
