import { FolderKanban } from "lucide-react";
import Link from "next/link";

export default function PortalTasksPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Yapılan Görevler</h1>
        <p className="text-muted-foreground">Projeniz kapsamında üzerinde çalışılan ve tamamlanan görevler.</p>
      </div>

      <div className="flex min-h-72 flex-col items-center justify-center rounded-sm border border-dashed border-border bg-muted/20 p-8 text-center">
        <FolderKanban className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          Görev detayları yapım aşamasında
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Yakında tüm görevlerin anlık durumlarını detaylıca buradan görebileceksiniz. Şimdilik proje detay sayfasından takip edebilirsiniz.
        </p>
        <Link href="/portal" className="mt-4 text-primary hover:underline text-sm font-medium">
          Dashboard'a dön
        </Link>
      </div>
    </div>
  );
}
