import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, Badge } from "poyraz-ui/atoms";
import { CheckCircle2, Clock, CalendarDays, KanbanSquare } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function PortalTasksPage() {
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
  
  let tasks = [];
  if (projectIds.length > 0) {
    const { data: tasksData } = await supabase
      .from("tasks")
      .select("id, title, status, project_id, created_at, date, priority")
      .in("project_id", projectIds)
      .eq("is_public_to_client", true)
      .order("created_at", { ascending: false });
    tasks = tasksData || [];
  }

  const getProjectName = (id: string) => projectsData?.find(p => p.id === id)?.name || "Bilinmeyen Proje";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Yapılan Görevler</h1>
        <p className="text-muted-foreground">Sizinle paylaşılan aktif ve tamamlanmış görevleri buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.length === 0 ? (
          <div className="col-span-full py-10 text-center border rounded-lg border-dashed text-muted-foreground flex flex-col items-center gap-3">
            <KanbanSquare className="w-10 h-10 text-muted-foreground/50" />
            Henüz sizinle paylaşılan bir görev bulunmuyor.
          </div>
        ) : (
          tasks.map(task => (
            <Card key={task.id} className="h-full">
              <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={task.status === 'completed' || task.status === 'done' ? "font-semibold text-lg line-through text-muted-foreground line-clamp-2" : "font-semibold text-lg line-clamp-2"}>
                      {task.title}
                    </h3>
                    <Badge variant={task.status === 'completed' || task.status === 'done' ? 'secondary' : 'outline'} className="capitalize shrink-0">
                      {task.status === 'todo' ? 'Bekliyor' : task.status === 'in_progress' ? 'İşleniyor' : 'Tamamlandı'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                    <span className="font-medium truncate">{getProjectName(task.project_id)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-4">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    <span>{task.date ? format(new Date(task.date), 'd MMM yyyy', { locale: tr }) : 'Tarih yok'}</span>
                  </div>
                  {task.status === 'completed' || task.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
