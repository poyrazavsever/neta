"use client";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sidebarData } from "@/config/sidebar";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Settings2 } from "lucide-react";
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

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="relative h-screen overflow-hidden bg-background text-foreground">
      <AmbientBackdrop />

      <div className="relative z-10 flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden shrink-0 lg:block lg:w-[260px] h-screen border-r border-white/5 bg-[#0A0710]">
          <SidebarPanel pathname={pathname} user={user} desktop />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileSidebarOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex lg:hidden"
            >
              <button
                type="button"
                aria-label="Menüyü kapat"
                className="absolute inset-0 bg-background/75 backdrop-blur-sm"
                onClick={closeMobileSidebar}
              />
              <motion.div
                initial={{ x: -48, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -48, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 h-full w-[min(88vw,280px)] bg-[#0A0710]"
              >
                <SidebarPanel
                  pathname={pathname}
                  user={user}
                  onNavigate={closeMobileSidebar}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Main Content Area (Scrollable internally) */}
        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto tiny-scrollbar relative">
          {/* Mobile Menu Button */}
          <div className="lg:hidden p-4 flex items-center justify-between z-30 sticky top-0 bg-background/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Image src="/logo/logo.png" alt="Cognis Logo" width={24} height={24} className="object-contain" />
              <span className="font-semibold text-sm">Cognis</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-lg border-border bg-white/5 h-8 w-8"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          <main className="flex-1 p-4 lg:p-8">
            <div className="min-h-[calc(100vh-2rem)] rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(31,23,43,0.3),rgba(18,13,28,0.1))] shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
              <div className="h-full p-6 md:p-8">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarPanel({
  pathname,
  user,
  desktop = false,
  onNavigate,
}: {
  pathname: string;
  user: DashboardShellProps["user"];
  desktop?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <aside className="flex h-full flex-col overflow-hidden">
      {/* Header / Logo */}
      <div className="pt-8 pb-4 flex justify-center">
        <Link href="/" className="relative flex items-center justify-center" onClick={onNavigate}>
          <Image
            src="/logo/logo.png"
            alt="Cognis Logo"
            width={48}
            height={48}
            className="object-contain transition-transform hover:scale-105"
            priority
          />
        </Link>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-4 px-3 overflow-y-auto tiny-scrollbar mt-4 pb-4">
        {sidebarData.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((route) => {
                const isActive =
                  route.href === "/"
                    ? pathname === "/"
                    : route.href
                    ? pathname === route.href || pathname.startsWith(route.href + "/")
                    : false;

                return (
                  <Link
                    key={route.href || route.title}
                    href={route.href || "#"}
                    className="block w-full"
                    onClick={onNavigate}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300 w-full",
                        isActive
                          ? "bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(108,91,176,0.15)] text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent",
                      )}
                    >
                      {route.icon && (
                        <route.icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground/70",
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      )}
                      <span className="text-[14px]">{route.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User Profile & Settings Section */}
      <div className="mt-auto p-3">
        <div className="mb-2">
          <Link
            href="/settings"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300 w-full",
              pathname.startsWith("/settings")
                ? "bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(108,91,176,0.15)] text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            )}
          >
            <Settings2 className="h-[18px] w-[18px] shrink-0" strokeWidth={pathname.startsWith("/settings") ? 2.5 : 2} />
            <span className="text-[14px]">Ayarlar</span>
          </Link>
        </div>

        {/* Separator */}
        <div className="h-[1px] w-full bg-white/5 mb-3" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-md p-2 transition-all hover:bg-white/5 outline-none"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar user={user} size="sm" />
                <div className="min-w-0 text-left">
                  <div className="truncate text-sm font-medium text-foreground leading-tight">
                    {user.displayName}
                  </div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="end"
            sideOffset={16}
            className="w-56 rounded-lg border border-white/10 bg-[#0A0710] p-1 text-foreground shadow-2xl"
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <form action={signOut}>
              <button type="submit" className="w-full">
                <DropdownMenuItem className="rounded-md px-2 py-1.5 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer flex items-center gap-2 text-sm">
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function Avatar({ user }: { user: DashboardShellProps["user"] }) {
  if (user.avatarUrl) {
    return (
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-primary/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/20 font-semibold text-primary-foreground text-sm">
      {user.shortName}
    </div>
  );
}

function AmbientBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(108,91,176,0.1),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(108,91,176,0.1),transparent_30%)]" />
    </>
  );
}

