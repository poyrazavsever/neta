"use client";

import { signOut } from "@/app/login/actions";
import { Button } from "poyraz-ui/atoms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "poyraz-ui/molecules";
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
import { ChevronUp, LogOut, Menu, Settings } from "lucide-react";
import Image from "next/image";
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
        <AppSidebar 
          pathname={pathname} 
          user={user} 
          className="sticky top-0 hidden h-screen shrink-0 self-stretch lg:flex"
        />

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <AppSidebar
          pathname={pathname}
          user={user}
          onNavigate={() => setIsMobileSidebarOpen(false)}
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        />

        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
            <Link href="/" className="flex justify-center items-center gap-2 font-semibold">
              <Image
                src="/logo/blackLogoLong.png"
                alt="Neta"
                width={120}
                height={32}
                className="h-8 w-auto object-contain"
                style={{ width: "auto" }}
                priority
              />
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

          <main className="flex-1 p-4 lg:p-8 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

function AppSidebar({
  pathname,
  user,
  onNavigate,
  className,
}: {
  pathname: string;
  user: DashboardShellProps["user"];
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <Sidebar
      variant="bordered"
      className={cn(
        "flex h-dvh max-h-dvh flex-col overflow-hidden rounded-none border-y-0 border-l-0 border-r border-border",
        className
      )}
    >
      <SidebarHeader className="shrink-0 border-b-0 px-6 py-3">
        <Link href="/" className="flex w-full items-center justify-center">
          <Image
            src="/logo/blackLogoLong.png"
            alt="Neta"
            width={160}
            height={48}
            className="h-12 w-auto object-contain"
            style={{ width: "auto" }}
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 my-0 w-full" />

      <SidebarContent className="tiny-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {sidebarData.map((group, groupIndex) => (
          <div key={group.title}>
            <SidebarSection title={group.title} defaultOpen className="mb-0">
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
            {groupIndex < sidebarData.length - 1 ? (
              <SidebarSeparator className="-mx-6 my-5 w-[calc(100%+3rem)]" />
            ) : null}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="mt-auto shrink-0 border-t border-border px-6 py-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full rounded-sm text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-2">
                <SidebarUserProfile
                  name={user.displayName}
                  role={user.email}
                  avatarUrl={user.avatarUrl || undefined}
                  initials={user.shortName}
                  className="min-w-0 flex-1"
                />
                <ChevronUp className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <span className="truncate text-sm font-medium text-foreground">
                  {user.displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" onClick={onNavigate} className="gap-2">
                <Settings className="h-4 w-4" />
                Ayarlar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full gap-2">
                  <LogOut className="h-4 w-4" />
                  Çıkış yap
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarTrigger className="hidden" />
    </Sidebar>
  );
}
