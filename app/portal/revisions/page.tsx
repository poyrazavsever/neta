import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, Badge } from "poyraz-ui/atoms";
import { Clock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function PortalRevisionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: clientData } = await supabase
    .from("clients")
    .select("id")
    .eq("client_auth_id", user.id)
    .single();

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <h2 className="text-2xl font-semibold">Hesabınız Henüz Aktif Değil</h2>
      </div>
    );
  }

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name")
    .eq("client_id", clientData.id);

  const projectIds = projectsData?.map(p => p.id) || [];
  
  let revisions = [];
  if (projectIds.length > 0) {
    const { data: revisionsData } = await supabase
      .from("project_revisions")
      .select("id, description, status, project_id, created_at")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });
    revisions = revisionsData || [];
  }

  const getProjectName = (id: string) => projectsData?.find(p => p.id === id)?.name || "Bilinmeyen Proje";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Revizyon Taleplerim</h1>
        <p className="text-muted-foreground">İlettiğiniz tüm revizyon taleplerinin güncel durumunu buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {revisions.length === 0 ? (
          <div className="col-span-full py-10 text-center border rounded-lg border-dashed text-muted-foreground flex flex-col items-center gap-3">
            <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
            Henüz bir revizyon talebinde bulunmadınız.
          </div>
        ) : (
          revisions.map(rev => (
            <Card key={rev.id} className="h-full">
              <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(rev.created_at), "d MMM yyyy, HH:mm", { locale: tr })}
                    </div>
                    <Badge variant={
                      rev.status === 'completed' ? 'default' : 
                      rev.status === 'rejected' ? 'destructive' : 'secondary'
                    } className="capitalize shrink-0">
                      {rev.status === 'pending' ? 'Bekliyor' : 
                       rev.status === 'in_progress' ? 'İşleniyor' : 
                       rev.status === 'completed' ? 'Tamamlandı' : 'Reddedildi'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium uppercase text-muted-foreground">Proje:</span>
                    <span className="text-sm font-semibold truncate bg-muted/30 p-2 rounded-md">
                      {getProjectName(rev.project_id)}
                    </span>
                  </div>

                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {rev.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-end border-t border-border pt-4">
                  <Link href={`/portal/projects/${rev.project_id}`} className="text-xs text-primary font-medium hover:underline">
                    Projeye Git &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
