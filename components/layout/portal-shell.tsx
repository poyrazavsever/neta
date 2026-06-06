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
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type PortalShellProps = {
  children: React.ReactNode;
  user: {
    email: string;
    displayName: string;
    shortName: string;
    avatarUrl: string | null;
  };
};

export function PortalShell({ children, user }: PortalShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 md:px-8 backdrop-blur">
        <div className="flex items-center gap-6">
          <Link href="/portal" className="flex items-center gap-2 font-semibold">
            <Image
              src="/logo/LogoWithBg.png"
              alt="Cognis"
              width={32}
              height={32}
              className="rounded-sm object-cover"
              priority
            />
            Cognis Portal
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link 
              href="/portal" 
              className={`transition-colors hover:text-primary ${pathname === '/portal' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0 border border-border overflow-hidden">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.displayName} width={36} height={36} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-medium">{user.shortName}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-500" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
