"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, Badge, Button, Textarea, Label } from "poyraz-ui/atoms";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "poyraz-ui/molecules";
import { CheckCircle2, Clock, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { createRevisionRequest } from "./actions";

export function PortalProjectClient({ project, sections, tasks, revisions, clientId }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openRevision, setOpenRevision] = useState(false);

  const handleRevision = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await createRevisionRequest(project.id, clientId, formData);
      if (res.error) throw new Error(res.error);
      toast.success("Revizyon talebiniz başarıyla iletildi.");
      setOpenRevision(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRevisions = revisions.filter((r: any) => r.status === 'pending' || r.status === 'in_progress').length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          {project.description && <p className="text-muted-foreground">{project.description}</p>}
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1 capitalize text-sm">{project.status}</Badge>
            <Dialog open={openRevision} onOpenChange={setOpenRevision}>
              <DialogTrigger asChild>
                <Button className="gap-2 shrink-0">
                  <RefreshCw className="h-4 w-4" /> Revizyon Talep Et
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleRevision}>
                  <DialogHeader>
                    <DialogTitle>Yeni Revizyon Talebi</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    {pendingRevisions > 0 && (
                      <div className="p-3 bg-amber-500/10 text-amber-600 rounded-md text-sm border border-amber-500/20">
                        Şu anda sonuçlanmamış {pendingRevisions} adet revizyon talebiniz var. Yeni bir tane eklemek istediğinize emin misiniz?
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Lütfen yapılmasını istediğiniz değişiklikleri detaylıca açıklayın</Label>
                      <Textarea name="description" required rows={5} placeholder="Şu kısmın rengi mavi olabilir mi? Ayrıca metinleri güncelleyelim..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpenRevision(false)}>İptal</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Talebi Gönder
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {project.due_date && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Teslim: {format(new Date(project.due_date), 'd MMM yyyy', { locale: tr })}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Project Planning / Milestones */}
          <Card>
            <CardContent className="p-5 space-y-6">
              <h3 className="font-semibold text-lg border-b border-border pb-2">Proje Planı & Aşamalar</h3>
              {sections.length === 0 ? (
                <p className="text-muted-foreground italic">Henüz bir plan yüklenmemiş.</p>
              ) : (
                <div className="space-y-4">
                  {sections.map((section: any) => (
                    <div key={section.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{section.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {section.type === 'milestone' ? 'Milestone' : section.type === 'deliverable' ? 'Teslimat' : 'Not'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revisions */}
          {revisions.length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-6">
                <h3 className="font-semibold text-lg border-b border-border pb-2">Revizyon Talepleriniz</h3>
                <div className="space-y-4">
                  {revisions.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-md border border-border bg-muted/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(rev.created_at), "d MMM yyyy, HH:mm", { locale: tr })}
                        </div>
                        <Badge variant={
                          rev.status === 'completed' ? 'default' : 
                          rev.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {rev.status === 'pending' ? 'Bekliyor' : 
                           rev.status === 'in_progress' ? 'İşleniyor' : 
                           rev.status === 'completed' ? 'Tamamlandı' : 'Reddedildi'}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{rev.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">İlerleme Durumu</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span>%{project.progress}</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${project.progress}%` }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Tamamlanan İşler
              </h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Listelenecek açık görev bulunmuyor.</p>
              ) : (
                <ul className="space-y-3">
                  {tasks.map((task: any) => (
                    <li key={task.id} className="text-sm flex gap-2">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className={task.status === 'completed' ? "line-through text-muted-foreground" : "text-foreground"}>
                          {task.title}
                        </span>
                        {task.date && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(task.date), 'd MMM yyyy', { locale: tr })}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
