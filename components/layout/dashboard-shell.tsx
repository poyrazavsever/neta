"use client";

import { signOut } from "@/app/login/actions";
import { Button } from "poyraz-ui/atoms";
import {
  Sidebar,
  SidebarBranding,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSection,
  SidebarSeparator,
  SidebarTrigger,
  SidebarUserProfile,
} from "poyraz-ui/organisms";
import { sidebarData } from "@/config/sidebar";
import { cn } from "@/lib/utils";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    email: string;
    displayName: string;
    shortName: string;
    avatarUrl: string | null;
  };
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-border bg-background lg:block">
          <AppSidebar pathname={pathname} user={user} />
        </aside>

        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Menuyu kapat"
              className="absolute inset-0 bg-overlay"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <aside className="relative h-full w-[min(88vw,300px)] border-r border-border bg-background">
              <AppSidebar
                pathname={pathname}
                user={user}
                onNavigate={() => setIsMobileSidebarOpen(false)}
              />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-xs text-primary-foreground">
                C
              </span>
              Cognis
            </Link>
            <Button
              type="button"
              variant="outline"
              className="h-9 w-9 p-0"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </header>

          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function AppSidebar({
  pathname,
  user,
  onNavigate,
}: {
  pathname: string;
  user: DashboardShellProps["user"];
  onNavigate?: () => void;
}) {
  return (
    <Sidebar variant="bordered" className="h-full rounded-none border-0">
      <SidebarHeader>
        <SidebarBranding
          title="Cognis"
          subtitle="Freelancer OS"
          logo={
            <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-sm font-bold text-primary-foreground">
              C
            </span>
          }
        />
      </SidebarHeader>

      <SidebarContent className="tiny-scrollbar">
        {sidebarData.map((group) => (
          <SidebarSection key={group.title} title={group.title} defaultOpen>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href
                      ? pathname === item.href || pathname.startsWith(item.href + "/")
                      : false;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem
                    key={item.href || item.title}
                    active={isActive}
                    icon={Icon ? <Icon className="h-4 w-4" /> : undefined}
                    className={cn(isActive && "font-semibold")}
                  >
                    <Link
                      href={item.href || "#"}
                      onClick={onNavigate}
                      className="block w-full"
                    >
                      {item.title}
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarSection>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="space-y-3">
        <SidebarUserProfile
          name={user.displayName}
          role={user.email}
          avatarUrl={user.avatarUrl || undefined}
          initials={user.shortName}
        />
        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            className="h-10 w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cikis yap
          </Button>
        </form>
      </SidebarFooter>

      <SidebarTrigger className="hidden" />
    </Sidebar>
  );
}
