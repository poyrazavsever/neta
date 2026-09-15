import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import type { ClientActivity, ClientDetail } from '@neta/api-contracts';

import { Badge, Button, Card, EmptyState, InfoBox, ListRow, Screen, Skeleton } from '@/components/ui';
import type { AppIconName } from '@/components/ui/app-icon';
import { getClientDetail, listClientActivities } from '@/features/clients/api';
import { toClientError } from '@/lib/api/errors';
import { hasInstanceCapability } from '@/lib/instance/capabilities';
import { formatDateTime } from '@/lib/resource/format';
import { useSession } from '@/providers/session-provider';
import { useTheme } from '@/providers/theme-provider';
import { spacing } from '@/theme/tokens';

export default function ClientDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useSession();
  const { colors } = useTheme();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id || session.status !== 'authenticated' || session.role !== 'freelancer') return;
    setLoading(true); setError(null);
    try {
      const [detail, activityPage] = await Promise.all([getClientDetail(session.instance, session.user, id), listClientActivities(session.instance, session.user, id)]);
      setClient(detail.data); setActivities(activityPage.data.items);
    } catch (loadError) { setError(toClientError(loadError, 'Müşteri detayı alınamadı.').message); }
    finally { setLoading(false); }
  }, [id, session]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading && !client) return <Screen scroll><View style={styles.content}><Skeleton height={116} /><Skeleton height={180} /><Skeleton height={220} /></View></Screen>;
  if (error && !client) return <Screen centered contentStyle={styles.centered}><InfoBox action={<Button onPress={() => void load()}>Tekrar dene</Button>} description={error} title="Müşteri açılamadı" tone="danger" /></Screen>;
  if (!client) return <Screen centered contentStyle={styles.centered}><EmptyState description="Müşteri kaydı bulunamadı." title="Kayıt yok" /></Screen>;
  const canMutate = session.instance ? hasInstanceCapability(session.instance, 'freelancer.core-mutations.v1') : false;
  const locale = session.instance?.defaultLocale ?? 'tr';

  return <Screen onRefresh={() => void load()} refreshing={loading} scroll><View style={styles.content}>
    {error ? <InfoBox description={error} title="Bazı bilgiler yenilenemedi" tone="warning" /> : null}
    <Card style={styles.hero}><View style={styles.row}><View style={styles.copy}><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{client.displayName}</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>{client.company ?? client.email ?? 'Müşteri profili'}</Text></View><Badge tone={client.status === 'active' ? 'success' : client.status === 'paused' ? 'warning' : 'neutral'}>{client.status}</Badge></View></Card>
    {canMutate ? <View style={styles.actions}><Button onPress={() => router.push({ pathname: '/client', params: { clientId: client.id } } as unknown as Href)}>Düzenle</Button>{client.email ? <Button onPress={() => router.push({ pathname: '/invitation', params: { clientId: client.id, email: client.email } } as unknown as Href)} variant="ghost">Portal daveti</Button> : null}</View> : null}

    <Card><ListRow description={client.email ?? 'Eklenmemiş'} icon={{ ios: 'envelope.fill', android: 'mail' }} title="E-posta" /><ListRow description={client.phone ?? 'Eklenmemiş'} icon={{ ios: 'phone.fill', android: 'call' }} title="Telefon" /><ListRow description={`${client.projectCount} proje · ${client.pipelineStatus}`} icon={{ ios: 'folder.fill', android: 'folder' }} title="İş ilişkisi" /><ListRow description={client.portalStatus ?? 'disabled'} icon={{ ios: 'person.badge.key.fill', android: 'key' }} title="Portal erişimi" /></Card>

    <View style={styles.sectionHeading}><View style={styles.copy}><Text accessibilityRole="header" style={[styles.sectionTitle, { color: colors.text }]}>Aktiviteler</Text><Text style={[styles.subtitle, { color: colors.textMuted }]}>Görüşme ve not geçmişi</Text></View>{canMutate ? <Button onPress={() => router.push({ pathname: '/client-activity', params: { clientId: id } } as unknown as Href)} variant="secondary">Aktivite ekle</Button> : null}</View>
    {activities.length === 0 ? <EmptyState description="Bu müşteri için henüz aktivite bulunmuyor." title="Aktivite yok" /> : <Card>{activities.map((activity) => <ListRow description={`${activity.note} · ${formatDateTime(activity.createdAt, locale)}`} icon={activityIcon(activity.type)} key={activity.id} title={activity.type} />)}</Card>}

    {client.notes ? <Card><Text style={[styles.subtitle, { color: colors.textMuted }]}>{client.notes}</Text></Card> : null}
  </View></Screen>;
}
function activityIcon(type: ClientActivity['type']): AppIconName { return type === 'call' ? { ios: 'phone.fill', android: 'call' } : type === 'email' ? { ios: 'envelope.fill', android: 'mail' } : type === 'meeting' ? { ios: 'person.2.fill', android: 'groups' } : { ios: 'note.text', android: 'notes' }; }
const styles = StyleSheet.create({ actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, centered: { maxWidth: 560, padding: spacing.lg }, content: { gap: spacing.md, paddingVertical: spacing.xl }, copy: { flex: 1, gap: spacing.xs }, hero: { gap: spacing.lg }, row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md }, sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' }, sectionTitle: { fontSize: 22, fontWeight: '900' }, subtitle: { fontSize: 14, lineHeight: 20 }, title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 } });
