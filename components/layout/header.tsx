"use client";

import { User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="text-sm text-muted-foreground font-medium">
        Kişisel Odak Alanı
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">Lokal Kullanıcı</div>
        <div className="flex items-center justify-center h-9 w-9 bg-muted text-muted-foreground rounded-full">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
