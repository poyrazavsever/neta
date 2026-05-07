"use client";

import { User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border/40 bg-background/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="text-sm text-muted-foreground font-medium">
        Kişisel Odak Alanı
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">Lokal Kullanıcı</div>
        <div className="flex items-center justify-center h-9 w-9 bg-secondary text-secondary-foreground rounded-full border border-border/50">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
