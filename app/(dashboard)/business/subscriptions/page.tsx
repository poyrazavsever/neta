import { createClient } from "@/lib/supabase/server";
import { SubscriptionsClient, type SubscriptionRow } from "./subscriptions-client";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: subscriptionsData } = await supabase
    .from("subscriptions")
    .select(`
      id,
      name,
      amount,
      currency,
      billing_cycle,
      status,
      category,
      next_billing_date,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const subscriptions: SubscriptionRow[] = (subscriptionsData || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    amount: Number(s.amount),
    currency: s.currency,
    billing_cycle: s.billing_cycle,
    status: s.status,
    category: s.category,
    next_billing_date: s.next_billing_date,
    created_at: s.created_at,
  }));

  return <SubscriptionsClient subscriptions={subscriptions} />;
}
