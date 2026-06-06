import { createClient } from "@/lib/supabase/server";
import { ProposalsClient, type ProposalRow } from "./proposals-client";

export default async function ProposalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: proposalsData } = await supabase
    .from("proposals")
    .select(`
      id,
      title,
      amount,
      currency,
      status,
      valid_until,
      created_at,
      clients ( name ),
      projects ( name )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const proposals: ProposalRow[] = (proposalsData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    valid_until: p.valid_until,
    created_at: p.created_at,
    clientName: p.clients?.name || null,
    projectName: p.projects?.name || null,
  }));

  return <ProposalsClient proposals={proposals} />;
}
