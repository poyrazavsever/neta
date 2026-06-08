import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, Badge } from "poyraz-ui/atoms";
import { FolderKanban, CheckCircle2, Clock, Activity, Wallet, BarChart } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function PortalDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Get the Client record
  const { data: clientData } = await supabase
    .from("clients")
    .select("id, name, company_name")
    .eq("client_auth_id", user.id)
    .single();

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <h2 className="text-2xl font-semibold">Hesabınız Henüz Aktif Değil</h2>
        <p className="text-muted-foreground max-w-md">
          Freelancer'ınız sizin için hesabı oluşturdu ancak müşteri kartınızla henüz eşleşmedi veya bir hata oluştu. Lütfen iletişime geçin.
        </p>
      </div>
    );
  }

  // 2. Get Projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select("id, name, status, progress, due_date, budget_amount, currency, created_at")
    .eq("client_id", clientData.id)
    .order("created_at", { ascending: false });

  const projects = projectsData || [];
  
  const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const totalBudget = activeProjects.reduce((sum, p) => sum + (Number(p.budget_amount) || 0), 0);
  const avgProgress = projects.length > 0 ? (projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length).toFixed(0) : "0";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: projects[0]?.currency || "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Genel Bakış
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Müşteri Paneli
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Hoş geldiniz, {clientData.name}. Aktif projelerinizi, ilerlemeleri ve bütçe durumunuzu buradan takip edin.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Aktif Projeler" value={activeProjects.length.toString()} icon={FolderKanban} tone="blue" />
        <StatCard label="Tamamlanan" value={completedProjects.length.toString()} icon={CheckCircle2} tone="green" />
        <StatCard label="Ortalama İlerleme" value={`%${avgProgress}`} icon={BarChart} tone="amber" />
        <StatCard label="Aktif Bütçe" value={formatCurrency(totalBudget)} icon={Wallet} tone="red" />
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tüm Projeleriniz</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full py-10 text-center border rounded-lg border-dashed text-muted-foreground">
              Henüz size atanmış bir proje bulunmuyor.
            </div>
          ) : (
            projects.map(project => (
              <Link key={project.id} href={`/portal/projects/${project.id}`}>
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 shrink-0 rounded-full ${project.status === 'completed' ? 'bg-emerald-500' : project.status === 'active' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                          <h3 className="font-semibold text-base line-clamp-2 leading-tight">{project.name}</h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={project.status === 'completed' ? 'secondary' : 'default'} className="capitalize text-[10px] px-1.5 py-0">
                          {project.status === 'completed' ? 'Tamamlandı' : project.status === 'active' ? 'Aktif' : 'Beklemede'}
                        </Badge>
                        {project.due_date && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Teslim: {format(new Date(project.due_date), 'd MMM yyyy', { locale: tr })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-muted-foreground">İlerleme</span>
                        <span>%{project.progress}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${project.progress}%` }} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: any;
  tone: "green" | "blue" | "amber" | "red";
}) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-primary/10 text-primary",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
