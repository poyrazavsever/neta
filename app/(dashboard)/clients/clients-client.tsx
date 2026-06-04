"use client";

import {
  archiveClientRecord,
  createClientRecord,
  updateClientRecord,
} from "@/app/(dashboard)/clients/actions";
import { Badge, Button, Card, CardContent, Input, Label, Textarea } from "poyraz-ui/atoms";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "poyraz-ui/molecules";
import {
  Archive,
  ExternalLink,
  Mail,
  PauseCircle,
  Pencil,
  Phone,
  Plus,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type ClientListItem = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: "active" | "paused" | "archived";
  notes: string | null;
  created_at: string;
  projectCount: number;
  revenueTotal: number;
};

const statusLabels = {
  active: "Aktif",
  paused: "Duraklatıldı",
  archived: "Arşivlendi",
};

const statusClasses = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paused: "border-amber-200 bg-amber-50 text-amber-700",
  archived: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

type ClientsClientProps = {
  clients: ClientListItem[];
  totalRevenue: number;
  activeCount: number;
  pausedCount: number;
  archivedCount: number;
};

export function ClientsClient({
  clients,
  totalRevenue,
  activeCount,
  pausedCount,
  archivedCount,
}: ClientsClientProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredClients = normalizedQuery
    ? clients.filter((client) =>
        [
          client.name,
          client.company_name,
          client.email,
          client.phone,
          client.website,
          client.notes,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery)),
      )
    : clients;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Freelancer operasyonu
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              Müşteriler
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Çalıştığın müşterileri, iletişim bilgilerini ve temel iş durumunu tek
              ekrandan yönet.
            </p>
          </div>
        </div>

        <ClientDialog mode="create" />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Aktif müşteri"
          value={activeCount.toString()}
          icon={UserCheck}
          iconClassName="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="Duraklatıldı"
          value={pausedCount.toString()}
          icon={PauseCircle}
          iconClassName="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Arşiv"
          value={archivedCount.toString()}
          icon={Archive}
          iconClassName="bg-zinc-100 text-zinc-700"
        />
        <StatCard
          label="Kayıtlı gelir"
          value={formatCurrency(totalRevenue)}
          description="Ödenmiş gelir işlemleri"
          icon={Wallet}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Müşteri listesi
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredClients.length} kayıt görüntüleniyor.
              </p>
            </div>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Müşteri, firma, e-posta veya not ara"
              className="md:max-w-sm"
            />
          </div>

          {filteredClients.length > 0 ? (
            <div className="overflow-hidden rounded-sm border border-border">
              <div className="hidden grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b border-border bg-muted/40 px-4 py-3 text-xs font-medium uppercase text-muted-foreground lg:grid">
                <span>Müşteri</span>
                <span>İletişim</span>
                <span>Durum</span>
                <span>Projeler</span>
                <span className="text-right">İşlem</span>
              </div>
              <div className="divide-y divide-border">
                {filteredClients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState hasQuery={Boolean(normalizedQuery)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ClientRow({ client }: { client: ClientListItem }) {
  return (
    <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(client.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{client.name}</div>
            <div className="truncate text-sm text-muted-foreground">
              {client.company_name || "Firma bilgisi yok"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        {client.email ? (
          <Link href={`mailto:${client.email}`} className="flex items-center gap-2 hover:text-primary">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{client.email}</span>
          </Link>
        ) : null}
        {client.phone ? (
          <Link href={`tel:${client.phone}`} className="flex items-center gap-2 hover:text-primary">
            <Phone className="h-3.5 w-3.5" />
            <span className="truncate">{client.phone}</span>
          </Link>
        ) : null}
        {client.website ? (
          <Link
            href={getWebsiteHref(client.website)}
            target="_blank"
            className="flex items-center gap-2 hover:text-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
          </Link>
        ) : null}
        {!client.email && !client.phone && !client.website ? (
          <span>İletişim bilgisi yok</span>
        ) : null}
      </div>

      <div>
        <Badge className={statusClasses[client.status]}>
          {statusLabels[client.status]}
        </Badge>
      </div>

      <div className="text-sm">
        <div className="font-medium text-foreground">{client.projectCount}</div>
        <div className="text-muted-foreground">{formatCurrency(client.revenueTotal)}</div>
      </div>

      <div className="flex justify-start gap-2 lg:justify-end">
        <ClientDialog mode="edit" client={client} />
        {client.status !== "archived" ? (
          <form action={archiveClientRecord}>
            <input type="hidden" name="id" value={client.id} />
            <Button type="submit" variant="outline" className="h-9 min-w-24 gap-2 px-3">
              <Archive className="h-4 w-4" />
              Arşivle
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function ClientDialog({
  mode,
  client,
}: {
  mode: "create" | "edit";
  client?: ClientListItem;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const action = mode === "create" ? createClientRecord : updateClientRecord;

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    try {
      await action(formData);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={mode === "create" ? "default" : "outline"}
          className="h-9 min-w-24 gap-2 px-3"
        >
          {mode === "create" ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {mode === "create" ? "Müşteri ekle" : "Düzenle"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <form action={handleSubmit} className="space-y-5">
          {client ? <input type="hidden" name="id" value={client.id} /> : null}
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Yeni müşteri" : "Müşteriyi düzenle"}
            </DialogTitle>
            <DialogDescription>
              Müşteri bilgilerini sade tut; proje ve finans bağlantıları sonraki
              modüllerden otomatik görünecek.
            </DialogDescription>
          </DialogHeader>

          <ClientFormFields client={client} />

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {mode === "create" ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {isSubmitting
                ? "Kaydediliyor"
                : mode === "create"
                  ? "Müşteriyi ekle"
                  : "Değişiklikleri kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClientFormFields({ client }: { client?: ClientListItem }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={`name-${client?.id || "new"}`}>Müşteri adı</Label>
        <Input
          id={`name-${client?.id || "new"}`}
          name="name"
          defaultValue={client?.name || ""}
          required
          placeholder="Örn. Acme Corp"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`company-${client?.id || "new"}`}>Firma / marka adı</Label>
        <Input
          id={`company-${client?.id || "new"}`}
          name="company_name"
          defaultValue={client?.company_name || ""}
          placeholder="Opsiyonel"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`email-${client?.id || "new"}`}>E-posta</Label>
          <Input
            id={`email-${client?.id || "new"}`}
            name="email"
            type="email"
            defaultValue={client?.email || ""}
            placeholder="musteri@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`phone-${client?.id || "new"}`}>Telefon</Label>
          <PhoneInput
            id={`phone-${client?.id || "new"}`}
            name="phone"
            defaultValue={client?.phone || ""}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`website-${client?.id || "new"}`}>Web sitesi</Label>
          <WebsiteInput
            id={`website-${client?.id || "new"}`}
            name="website"
            defaultValue={client?.website || ""}
          />
        </div>
        <div className="grid gap-2">
          <Label>Durum</Label>
          <Select name="status" defaultValue={client?.status || "active"}>
            <SelectTrigger>
              <SelectValue placeholder="Durum seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="paused">Duraklatıldı</SelectItem>
              <SelectItem value="archived">Arşivlendi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`notes-${client?.id || "new"}`}>Notlar</Label>
        <Textarea
          id={`notes-${client?.id || "new"}`}
          name="notes"
          defaultValue={client?.notes || ""}
          placeholder="İletişim notları, beklentiler, özel bilgiler..."
          rows={4}
        />
      </div>
    </div>
  );
}

function PhoneInput({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <Input
      id={id}
      name={name}
      value={value}
      inputMode="tel"
      placeholder="+90 (5xx) xxx xx xx"
      onChange={(event) => setValue(formatPhone(event.target.value))}
    />
  );
}

function WebsiteInput({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <Input
      id={id}
      name={name}
      value={value}
      inputMode="url"
      placeholder="https://poyrazavsever.com"
      onChange={(event) => setValue(event.target.value.replace(/\s/g, ""))}
      onBlur={() => setValue(normalizeWebsite(value))}
    />
  );
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  iconClassName: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
            {description ? (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-sm ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-sm border border-dashed border-border bg-muted/20 p-8 text-center">
      <Users className="h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {hasQuery ? "Aramana uygun müşteri yok" : "Henüz müşteri eklenmedi"}
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasQuery
          ? "Arama metnini sadeleştirerek tekrar deneyebilirsin."
          : "İlk müşterini ekleyerek proje, görev ve finans kayıtlarını müşteriyle ilişkilendirmeye başlayabilirsin."}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatPhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const local = digits.startsWith("90")
    ? digits.slice(2, 12)
    : digits.startsWith("0")
      ? digits.slice(1, 11)
      : digits.slice(0, 10);

  const area = local.slice(0, 3);
  const first = local.slice(3, 6);
  const second = local.slice(6, 8);
  const third = local.slice(8, 10);

  let formatted = "+90";
  if (area) formatted += ` (${area}`;
  if (area.length === 3) formatted += ")";
  if (first) formatted += ` ${first}`;
  if (second) formatted += ` ${second}`;
  if (third) formatted += ` ${third}`;

  return formatted;
}

function normalizeWebsite(input: string) {
  const value = input.trim().replace(/\s/g, "");

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function getWebsiteHref(input: string) {
  return /^https?:\/\//i.test(input) ? input : `https://${input}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
