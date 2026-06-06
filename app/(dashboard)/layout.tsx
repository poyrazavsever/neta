import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  if (profile?.role === "client") {
    const { redirect } = await import("next/navigation");
    redirect("/portal");
  }

  const fallbackName = user?.email?.split("@")[0] ?? "Cognis Kullanıcısı";
  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    fallbackName;

  const shortName = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2) || "MS";

  return (
    <DashboardShell
      user={{
        email: user?.email ?? "bilinmiyor@mindspace.local",
        displayName,
        shortName,
        avatarUrl:
          profile?.avatar_url ||
          user?.user_metadata?.avatar_url ||
          user?.user_metadata?.picture ||
          null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
