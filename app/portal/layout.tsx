import { PortalShell } from "@/components/layout/portal-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "client") {
    redirect("/");
  }

  const fallbackName = user.email?.split("@")[0] ?? "Müşteri";
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
    <PortalShell
      user={{
        email: user.email ?? "bilinmiyor@mindspace.local",
        displayName,
        shortName,
        avatarUrl: profile?.avatar_url || null,
      }}
    >
      {children}
    </PortalShell>
  );
}
