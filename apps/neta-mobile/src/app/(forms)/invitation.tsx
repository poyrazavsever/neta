import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { FormSheet, useKeyboardForm } from '@/components/forms';
import { InfoBox, TextField, useToast } from '@/components/ui';
import { inviteClientPortal } from '@/features/clients/api';
import { toClientError } from '@/lib/api/errors';
import { useSession } from '@/providers/session-provider';
import { useTheme } from '@/providers/theme-provider';

type Field = 'email' | 'locale';
export default function InvitationFormRoute() {
  const params = useLocalSearchParams<{ clientId?: string; email?: string }>(); const session = useSession(); const { colors } = useTheme(); const { showToast } = useToast(); const keyboard = useKeyboardForm<Field>();
  const initial = useMemo(() => ({ email: params.email ?? '', locale: session.instance?.defaultLocale ?? 'tr' }), [params.email, session.instance?.defaultLocale]);
  const [form, setForm] = useState(initial); const [error, setError] = useState<string | null>(null); const [fieldError, setFieldError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false); const [invitation, setInvitation] = useState<{ expiresAt: string; url: string } | null>(null);
  const submit = async () => { if (!params.clientId || session.status !== 'authenticated' || session.role !== 'freelancer') return; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setFieldError('Geçerli bir e-posta adresi gir.'); keyboard.focusFirstError({ email: 'error' }, ['email']); return; } setSubmitting(true); setError(null); try { const result = await inviteClientPortal(session.instance, session.user, params.clientId, { defaultLocale: form.locale.trim(), email: form.email.trim() }); setInvitation({ expiresAt: result.data.expiresAt, url: result.data.invitationUrl }); showToast({ message: 'Tek kullanımlık bağlantıyı müşterinle güvenli biçimde paylaş.', title: 'Davet hazır', tone: 'success' }); } catch (submitError) { setError(toClientError(submitError, 'Portal daveti hazırlanamadı.').message); } finally { setSubmitting(false); } };
  return <FormSheet dirty={!invitation && JSON.stringify(form) !== JSON.stringify(initial)} onSubmit={() => void submit()} scrollRef={keyboard.scrollRef} submitLabel={invitation ? 'Yeni bağlantı üret' : 'Daveti hazırla'} submitting={submitting} title="Portal daveti"><Text style={[styles.lead, { color: colors.textMuted }]}>Müşteri bu bağlantıyla yalnızca kendisine açık proje, görev ve revizyonları görür.</Text>{error ? <InfoBox description={error} title="Davet hazırlanamadı" tone="danger" /> : null}{invitation ? <InfoBox description={`Bağlantı ${new Date(invitation.expiresAt).toLocaleString()} tarihine kadar geçerli.`} title="Davet bağlantısı" tone="success" /> : null}{invitation ? <Text selectable style={[styles.link, { color: colors.primary }]}>{invitation.url}</Text> : null}<TextField autoCapitalize="none" autoComplete="email" autoCorrect={false} error={fieldError ?? undefined} keyboardType="email-address" label="Davet e-postası" onChangeText={(email) => { setForm((value) => ({ ...value, email })); setFieldError(null); setInvitation(null); }} onFocus={() => keyboard.onFocus('email')} ref={keyboard.register('email')} value={form.email} /><TextField autoCapitalize="none" label="Portal dili" onChangeText={(locale) => { setForm((value) => ({ ...value, locale })); setInvitation(null); }} onFocus={() => keyboard.onFocus('locale')} ref={keyboard.register('locale')} value={form.locale} /></FormSheet>;
}
const styles = StyleSheet.create({ lead: { fontSize: 15, lineHeight: 22 }, link: { fontSize: 14, lineHeight: 20 } });
