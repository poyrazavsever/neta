import { JournalClient, type DailyLogItem } from "@/app/(dashboard)/journal/journal-client";
import { createClient } from "@/lib/supabase/server";

type DailyLogRow = {
  id: string;
  log_date: string;
  mood_score: number;
  energy_score: number;
  work_satisfaction_score: number | null;
  note: string | null;
};

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: logRows } = await supabase
    .from("daily_logs")
    .select("id, log_date, mood_score, energy_score, work_satisfaction_score, note")
    .eq("user_id", user.id)
    .order("log_date", { ascending: false })
    .limit(180);

  const logs: DailyLogItem[] = ((logRows || []) as DailyLogRow[]).map((log) => ({
    id: log.id,
    log_date: log.log_date,
    mood_score: Number(log.mood_score),
    energy_score: Number(log.energy_score),
    work_satisfaction_score:
      typeof log.work_satisfaction_score === "number" ? Number(log.work_satisfaction_score) : null,
    note: log.note,
  }));

  return <JournalClient logs={logs} />;
}
