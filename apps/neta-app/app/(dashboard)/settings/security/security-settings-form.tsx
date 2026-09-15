"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { KeyRound, Link2, Save, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import type { DeviceSessionInfo, PairingChallenge } from "@neta/api-contracts";
import { Button, Card, CardContent, Input, Label } from "poyraz-ui/atoms";
import { Alert, AlertDescription, AlertTitle, toast } from "poyraz-ui/molecules";
import { useTranslations } from "@/components/i18n/i18n-provider";
import { changePasswordAction } from "./actions";

export function SecuritySettingsForm() {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [pairing, setPairing] = useState<PairingChallenge | null>(null);
  const [devices, setDevices] = useState<DeviceSessionInfo[]>([]);
  const [pairingPassword, setPairingPassword] = useState("");

  async function loadDevices() {
    const response = await fetch("/api/v1/device-sessions", { headers: { Accept: "application/json" } });
    const payload = await response.json() as { data?: DeviceSessionInfo[] };
    if (response.ok && Array.isArray(payload.data)) setDevices(payload.data);
  }

  useEffect(() => { void loadDevices(); }, []);

  async function createPairing() {
    const response = await fetch("/api/v1/pairing/challenges", {
      body: JSON.stringify({ currentPassword: pairingPassword }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const payload = await response.json() as { data?: PairingChallenge; error?: { message?: string } };
    if (!response.ok || !payload.data) return toast.error(payload.error?.message ?? "Pairing kodu oluşturulamadı.");
    setPairing(payload.data);
    setPairingPassword("");
  }

  async function revokeDevice(id: string) {
    const response = await fetch(`/api/v1/device-sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Cihaz oturumu kapatılamadı.");
    setDevices((current) => current.filter((item) => item.id !== id));
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (result.errorKey) {
        toast.error(t(result.errorKey));
        return;
      }
      formRef.current?.reset();
      toast.success(t("settings.security.messages.saved"));
    });
  }

  return (
    <div className="space-y-6"><Card>
      <CardContent className="space-y-8 p-6 sm:p-8">
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold text-foreground">
            {t("settings.security.title")}
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("settings.security.description")}
          </p>
        </div>

        <Alert>
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("settings.security.sessions.title")}</AlertTitle>
          <AlertDescription>
            {t("settings.security.sessions.description")}
          </AlertDescription>
        </Alert>

        <form ref={formRef} action={submit} className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {t("settings.security.fields.currentPassword")}
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {t("settings.security.fields.newPassword")}
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("settings.security.fields.confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("settings.security.help.password")}
          </p>

          <div className="flex justify-end border-t border-border pt-6">
            <Button
              type="submit"
              variant="default"
              effect="shine"
              loading={pending}
              className="gap-2"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {t("settings.security.actions.save")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Smartphone className="h-5 w-5" /> Mobil cihazlar</h2>
            <p className="text-sm text-muted-foreground">Owner şifresini telefona girmeden, beş dakika geçerli tek kullanımlık kodla bağlan.</p>
          </div>
          <div className="flex max-w-2xl gap-3">
            <Input aria-label="Pairing için mevcut şifre" autoComplete="current-password" onChange={(event) => setPairingPassword(event.target.value)} placeholder="Mevcut şifre" type="password" value={pairingPassword} />
            <Button disabled={!pairingPassword} onClick={() => void createPairing()} type="button"><Link2 className="mr-2 h-4 w-4" />Kod üret</Button>
          </div>
          {pairing ? <Alert><AlertTitle>Tek kullanımlık kod: <span className="font-mono tracking-widest">{pairing.manualCode}</span></AlertTitle><AlertDescription>Kod {new Date(pairing.expiresAt).toLocaleTimeString()} saatine kadar geçerli. QR payload: <span className="break-all font-mono text-xs">{pairing.qrPayload}</span></AlertDescription></Alert> : null}
          <div className="space-y-2">
            {devices.map((device) => <div className="flex items-center justify-between rounded-xl border border-border p-3" key={device.id}>
              <div><p className="font-medium">{device.deviceLabel}</p><p className="text-xs text-muted-foreground">{device.platform} · Son kullanım {new Date(device.lastActiveAt).toLocaleString()}</p></div>
              {!device.revokedAt ? <Button aria-label="Cihazı kaldır" onClick={() => void revokeDevice(device.id)} size="sm" type="button" variant="ghost"><Trash2 className="h-4 w-4" /></Button> : <span className="text-xs text-muted-foreground">İptal edildi</span>}
            </div>)}
            {devices.length === 0 ? <p className="text-sm text-muted-foreground">Bağlı mobil cihaz yok.</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
