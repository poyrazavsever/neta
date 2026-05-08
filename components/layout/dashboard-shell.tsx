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
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenText,
  CheckSquare2,
  ChevronRight,
  LogOut,
  Menu,
  MessageCircleHeart,
  PanelLeftClose,
  Settings2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    email: string;
    displayName: string;
    shortName: string;
    avatarUrl: string | null;
  };
};

type RouteMeta = {
  eyebrow: string;
  title: string;
  description: string;
};

const routes = [
  {
    label: "Dashboard",
    href: "/",
    icon: Sparkles,
    description: "Günün ritmi ve genel görünüm",
  },
  {
    label: "Günlük",
    href: "/journal",
    icon: BookOpenText,
    description: "Düşünceler, duygu ve enerji kayıtları",
  },
  {
    label: "Görevler",
    href: "/tasks",
    icon: CheckSquare2,
    description: "Planlar, öncelikler ve aksiyonlar",
  },
  {
    label: "Sohbet",
    href: "/chat",
    icon: MessageCircleHeart,
    description: "AI ile bağlamsal yansıma alanı",
  },
  {
    label: "Ayarlar",
    href: "/settings",
    icon: Settings2,
    description: "Profil, güvenlik ve AI tercihleri",
  },
] as const;

const routeMeta: Record<string, RouteMeta> = {
  "/": {
    eyebrow: "MindSpace Workspace",
    title: "Günün Nabzı",
    description: "Verilerini, odağını ve kişisel akışını tek panelden yönet.",
  },
  "/journal": {
    eyebrow: "Journal",
    title: "Düşünce Akışı",
    description: "Bugünün zihinsel yükünü yaz, duygu ve enerji izlerini kaydet.",
  },
  "/tasks": {
    eyebrow: "Tasks",
    title: "Aksiyon Katmanı",
    description: "Önceliklerini sadeleştir, küçük ama net adımlar belirle.",
  },
  "/chat": {
    eyebrow: "Reflective AI",
    title: "Yansıtıcı Sohbet",
    description: "Geçmiş kayıtlarınla bağ kuran özel AI eşlikçin burada.",
  },
  "/settings": {
    eyebrow: "Preferences",
    title: "Hesap ve Kontroller",
    description: "Profilini, güvenliği ve AI ayarlarını tek yerden yönet.",
  },
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  const currentMeta = useMemo(() => {
    if (pathname === "/") return routeMeta["/"];
    if (pathname?.startsWith("/journal")) return routeMeta["/journal"];
    if (pathname?.startsWith("/tasks")) return routeMeta["/tasks"];
    if (pathname?.startsWith("/chat")) return routeMeta["/chat"];
    if (pathname?.startsWith("/settings")) return routeMeta["/settings"];

    return routeMeta["/"];
  }, [pathname]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AmbientBackdrop />

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden shrink-0 lg:block lg:w-[320px]">
          <div className="sticky top-0 h-screen p-4 pr-0">
            <SidebarPanel pathname={pathname} user={user} desktop />
          </div>
        </div>

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
                className="relative z-10 h-full w-[min(88vw,340px)] p-4 pr-2"
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

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 px-4 pb-3 pt-4 md:px-6 lg:px-8">
            <TopBar
              user={user}
              currentMeta={currentMeta}
              todayLabel={todayLabel}
              onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            />
          </header>

          <main className="flex-1 px-4 pb-6 md:px-6 md:pb-8 lg:px-8">
            <div className="min-h-[calc(100vh-7rem)] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(31,23,43,0.84),rgba(18,13,28,0.72))] shadow-[0_30px_120px_rgba(7,5,14,0.45)] ring-1 ring-white/6 backdrop-blur-xl">
              <div className="h-full p-4 md:p-6 lg:p-8">{children}</div>
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
    <aside className="flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,23,43,0.96),rgba(18,13,28,0.88))] shadow-[0_24px_100px_rgba(7,5,14,0.52)] ring-1 ring-white/6 backdrop-blur-xl">
      <div className="relative overflow-hidden border-b border-white/8 px-5 pb-5 pt-6">
        <div className="absolute -left-8 top-0 h-24 w-24 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-0 top-8 h-16 w-16 rounded-full bg-white/10 blur-2xl" />

        <Link href="/" className="relative flex items-center gap-4" onClick={onNavigate}>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            <Image
              src="/logo/logo.png"
              alt="MindSpace Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary/80">
              Private Space
            </div>
            <div className="truncate text-xl font-semibold tracking-tight text-foreground">
              MindSpace
            </div>
            <div className="text-sm text-muted-foreground">
              Dingin, güvenli ve odaklı çalışma alanı
            </div>
          </div>
        </Link>
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
            Focus Layer
          </div>
          Yaz, gözlemle, planla. Tüm akışı sade ama güçlü bir panelde tut.
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {routes.map((route) => {
          const isActive =
            route.href === "/"
              ? pathname === "/"
              : pathname === route.href || pathname.startsWith(route.href + "/");

          return (
            <Link
              key={route.href}
              href={route.href}
              className="block"
              onClick={onNavigate}
            >
              <motion.div
                whileHover={{ x: 6 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border px-4 py-3.5 transition-all",
                  isActive
                    ? "border-primary/35 bg-primary/[0.14] shadow-[0_16px_40px_rgba(108,91,176,0.22)]"
                    : "border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.06]",
                )}
              >
                {isActive ? (
                  <motion.div
                    layoutId="dashboard-nav-active"
                    className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(108,91,176,0.2),rgba(108,91,176,0.08),transparent)]"
                  />
                ) : null}

                <div className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all",
                      isActive
                        ? "border-primary/30 bg-primary/20 text-primary-foreground shadow-[0_12px_28px_rgba(108,91,176,0.22)]"
                        : "border-white/8 bg-white/5 text-muted-foreground group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-foreground",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm font-semibold",
                        isActive ? "text-foreground" : "text-foreground/90",
                      )}
                    >
                      {route.label}
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-all",
                          isActive
                            ? "translate-x-0 text-primary"
                            : "translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                        )}
                      />
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {route.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-4 pt-5">
        <div className="mb-4 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar user={user} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">
                {user.displayName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            className={cn(
              "h-12 w-full justify-start gap-3 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all",
              "hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
            )}
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </form>

        {!desktop ? (
          <div className="mt-3 text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground/60">
            Secure workspace
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function TopBar({
  user,
  currentMeta,
  todayLabel,
  onOpenSidebar,
}: {
  user: DashboardShellProps["user"];
  currentMeta: RouteMeta;
  todayLabel: string;
  onOpenSidebar: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,23,43,0.82),rgba(18,13,28,0.68))] px-4 py-4 shadow-[0_20px_80px_rgba(7,5,14,0.3)] ring-1 ring-white/6 backdrop-blur-xl md:px-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="mt-0.5 shrink-0 rounded-2xl border-white/10 bg-white/[0.04] lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="min-w-0">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-primary/80">
              {currentMeta.eyebrow}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-[2rem]">
                {currentMeta.title}
              </h1>
              <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground">
                {todayLabel}
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {currentMeta.description}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Protected session
          </div>
          <UserMenu user={user} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end md:hidden">
        <UserMenu user={user} compact />
      </div>
    </div>
  );
}

function UserMenu({
  user,
  compact = false,
}: {
  user: DashboardShellProps["user"];
  compact?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all outline-none hover:border-white/16 hover:bg-white/[0.07]",
            compact ? "w-full justify-between" : "min-w-[220px]",
          )}
        >
          <div className="flex items-center gap-3">
            <Avatar user={user} />
            <div className={cn("min-w-0", compact ? "max-w-[160px]" : "max-w-[180px]")}>
              <div className="truncate text-sm font-semibold text-foreground">
                {user.displayName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user.email}
              </div>
            </div>
          </div>

          <div className="mr-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-muted-foreground transition-all group-hover:bg-white/10 group-hover:text-foreground">
            <PanelLeftClose className="h-4 w-4 rotate-[-90deg]" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(31,23,43,0.98),rgba(18,13,28,0.94))] p-2 text-foreground shadow-[0_20px_60px_rgba(7,5,14,0.45)] backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-3 py-2 text-foreground">
          <div className="flex items-center gap-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{user.displayName}</div>
              <div className="truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/8" />
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
          <Link href="/settings" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Ayarlar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5">
          <Link href="/journal" className="flex items-center gap-2">
            <BookOpenText className="h-4 w-4" />
            Günlük Alanı
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/8" />
        <div className="px-3 py-2 text-xs leading-5 text-muted-foreground">
          Bu menü profil ve hızlı erişim içindir. Ana çıkış aksiyonu soldaki
          panelin altındadır.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Avatar({
  user,
  size = "md",
}: {
  user: DashboardShellProps["user"];
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "h-11 w-11 text-sm" : "h-12 w-12 text-sm";

  if (user.avatarUrl) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_12px_36px_rgba(0,0,0,0.18)]",
          dimensions,
        )}
      >
        {/* Avatar URL dış kaynaklı olduğu için bu önizlemede native img kullanıyoruz. */}
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
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(108,91,176,0.32),rgba(255,255,255,0.08))] font-semibold text-foreground shadow-[0_12px_36px_rgba(0,0,0,0.18)]",
        dimensions,
      )}
    >
      {user.shortName}
    </div>
  );
}

function AmbientBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,91,176,0.18),transparent_34%),radial-gradient(circle_at_85%_14%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(108,91,176,0.14),transparent_28%)]" />
      <motion.div
        animate={{ x: [0, 28, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[-8rem] top-10 h-64 w-64 rounded-full bg-primary/10 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -32, 0], y: [0, 24, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-0 right-[-8rem] h-72 w-72 rounded-full bg-white/5 blur-[130px]"
      />
    </>
  );
}
