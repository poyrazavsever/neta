"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Book,
  CheckSquare,
  MessageCircle,
  Settings,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Günlük", path: "/journal", icon: Book },
  { name: "Görevler", path: "/tasks", icon: CheckSquare },
  { name: "Sohbet", path: "/chat", icon: MessageCircle },
  { name: "Ayarlar", path: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-secondary min-h-screen flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border text-primary">
        <BrainCircuit className="h-6 w-6 mr-2" />
        <h2 className="text-xl font-bold tracking-tight">MindSpace</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {routes.map((route) => {
          const isActive =
            pathname === route.path || pathname?.startsWith(route.path + "/");
          // Home route exact match check
          const isExactActive =
            route.path === "/" ? pathname === "/" : isActive;

          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                isExactActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50 text-xs text-muted-foreground/60 text-center">
        Local-First AI Workspace
      </div>
    </aside>
  );
}
