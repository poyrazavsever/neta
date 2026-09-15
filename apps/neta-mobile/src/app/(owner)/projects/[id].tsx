import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import type { PlanningSection, ProjectDetail, ProjectRevision, TaskListItem } from '@neta/api-contracts';

import { Badge, Button, Card, EmptyState, InfoBox, ListRow, Screen, Skeleton } from '@/components/ui';
import { getProjectDetail, listPlanningSections, listProjectRevisions } from '@/features/projects/api';
import { listTasks } from '@/features/tasks/api';
import { toClientError } from '@/lib/api/errors';
import { formatDateTime } from '@/lib/resource/format';
import { hasInstanceCapability } from '@/lib/instance/capabilities';
import { useSession } from '@/providers/session-provider';
import { useTheme } from '@/providers/theme-provider';
import { radius, spacing } from '@/theme/tokens';

type Segment = 'overview' | 'plan' | 'tasks' | 'revisions' | 'assets';
const segments: readonly { label: string; value: Segment }[] = [
  { label: 'Genel', value: 'overview' }, { label: 'Plan', value: 'plan' },
  { label: 'Görevler', value: 'tasks' }, { label: 'Revizyonlar', value: 'revisions' },
  { label: 'Dosyalar', value: 'assets' },
];

export default function ProjectDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useSession(); const { colors } = useTheme();
  const [segment, setSegment] = useState<Segment>('overview');
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [plan, setPlan] = useState<PlanningSection[]>([]); const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [revisions, setRevisions] = useState<ProjectRevision[]>([]);
  const [mainError, setMainError] = useState<string | null>(null);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<Exclude<Segment, 'overview'>, string>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id || session.status !== 'authenticated' || session.role !== 'freelancer') return;
    setLoading(true); setMainError(null);
    try {
      const detail = await getProjectDetail(session.instance, session.user, id); setProject(detail.data);
      const results = await Promise.allSettled([
        listPlanningSections(session.instance, session.user, id),
        listTasks(session.instance, session.user, { projectId: id }),
        listProjectRevisions(session.instance, session.user, id),
      ]);
      const nextErrors: Partial<Record<Exclude<Segment, 'overview'>, string>> = {
        assets: 'Dosya okuma capability’si bu fazda yayınlanmadı.',
      };
      const [planResult, taskResult, revisionResult] = results;
      if (planResult.status === 'fulfilled') setPlan(planResult.value.data.items); else nextErrors.plan = toClientError(planResult.reason, 'Plan verisi alınamadı.').message;
      if (taskResult.status === 'fulfilled') setTasks(taskResult.value.data.items); else nextErrors.tasks = toClientError(taskResult.reason, 'Görevler alınamadı.').message;
      if (revisionResult.status === 'fulfilled') setRevisions(revisionResult.value.data.items); else nextErrors.revisions = toClientError(revisionResult.reason, 'Revizyonlar alınamadı.').message;
      setSectionErrors(nextErrors);
    } catch (error) { setMainError(toClientError(error, 'Proje detayı alınamadı.').message); }
    finally { setLoading(false); }
  }, [id, session]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading && !project) return <Screen scroll><View style={styles.content}><Skeleton height={150} /><Skeleton height={56} /><Skeleton height={220} /></View></Screen>;
  if (mainError && !project) return <Screen centered contentStyle={styles.centered}><InfoBox action={<Button onPress={() => void load()}>Tekrar dene</Button>} description={mainError} title="Proje açılamadı" tone="danger" /></Screen>;
  if (!project) return <Screen centered><EmptyState description="Proje kaydı bulunamadı." title="Proje yok" /></Screen>;
  const canMutate = session.instance ? hasInstanceCapability(session.instance, 'freelancer.core-mutations.v1') : false;

  return <Screen onRefresh={() => void load()} refreshing={loading} scroll><View style={styles.content}>
    <Card style={styles.hero}><View style={styles.row}><View style={styles.copy}><Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{project.title}</Text><Text style={[styles.description, { color: colors.textMuted }]}>{project.clientName ?? 'Kişisel proje'} · %{project.progress} tamamlandı</Text></View><Badge tone={project.status === 'completed' ? 'success' : 'primary'}>{project.status}</Badge></View></Card>
    {canMutate ? <View style={styles.actions}><Button onPress={() => router.push({ pathname: '/project', params: { projectId: project.id } } as unknown as Href)}>Projeyi düzenle</Button><Button onPress={() => router.push({ pathname: '/task', params: { clientId: project.clientId ?? undefined, projectId: project.id } } as unknown as Href)} variant="ghost">Görev ekle</Button></View> : null}
    <View accessibilityLabel="Proje bölümleri" accessibilityRole="radiogroup" style={styles.segments}>{segments.map((item) => <SegmentButton key={item.value} label={item.label} onPress={() => setSegment(item.value)} selected={segment === item.value} />)}</View>
    <SegmentContent errors={sectionErrors} locale={session.instance?.defaultLocale ?? 'tr'} plan={plan} project={project} revisions={revisions} segment={segment} tasks={tasks} />
  </View></Screen>;
}

function SegmentContent({ errors, locale, plan, project, revisions, segment, tasks }: { errors: Partial<Record<Exclude<Segment, 'overview'>, string>>; locale: string; plan: PlanningSection[]; project: ProjectDetail; revisions: ProjectRevision[]; segment: Segment; tasks: TaskListItem[] }) {
  if (segment !== 'overview' && errors[segment]) return <InfoBox description={`${errors[segment]} Bu yüzey sahte veri göstermez; ilgili /api/v1 endpoint’i backend’de teslim edilmelidir.`} title="Bu bölüm kullanılamıyor" tone="warning" />;
  if (segment === 'overview') return <Card><ListRow description={project.type === 'client_project' ? 'Müşteri projesi' : 'Yan proje'} icon={{ ios: 'square.grid.2x2.fill', android: 'dashboard' }} title="Proje türü" /><ListRow description={project.dueDate ?? 'Belirlenmedi'} icon={{ ios: 'calendar', android: 'calendar_month' }} title="Bitiş tarihi" /><ListRow description={`${project.revisionsUsed}/${project.revisionAllowance ?? '∞'}`} icon={{ ios: 'arrow.triangle.2.circlepath', android: 'published_with_changes' }} title="Revizyon kullanımı" /></Card>;
  if (segment === 'plan') return plan.length ? <Card>{plan.map((item) => <ListRow description={item.content ?? `Sıra ${item.order}`} icon={{ ios: 'list.bullet.rectangle', android: 'view_list' }} key={item.id} title={item.title} />)}</Card> : <EmptyState description="Bu proje için planlama bölümü oluşturulmamış." title="Plan boş" />;
  if (segment === 'tasks') return tasks.length ? <Card>{tasks.map((task) => <ListRow description={`${task.status} · ${task.priority}`} icon={{ ios: task.status === 'done' ? 'checkmark.circle.fill' : 'circle', android: task.status === 'done' ? 'check_circle' : 'radio_button_unchecked' }} key={task.id} onPress={() => router.push({ pathname: '/(owner)/tasks/[id]', params: { id: task.id } } as unknown as Href)} title={task.title} />)}</Card> : <EmptyState description="Bu projeye bağlı görev bulunmuyor." title="Görev yok" />;
  return revisions.length ? <Card>{revisions.map((revision) => <ListRow description={`${revision.description} · ${formatDateTime(revision.createdAt, locale)}`} icon={{ ios: 'arrow.triangle.2.circlepath', android: 'published_with_changes' }} key={revision.id} title={revision.status} />)}</Card> : <EmptyState description="Bu proje için revizyon kaydı yok." title="Revizyon yok" />;
}

function SegmentButton({ label, onPress, selected }: { label: string; onPress: () => void; selected: boolean }) { const { colors } = useTheme(); return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.segment, { backgroundColor: selected ? colors.primary : colors.surfaceMuted, borderColor: colors.border }]}><Text style={{ color: selected ? colors.primaryForeground : colors.text }}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({ actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, centered: { maxWidth: 560, padding: spacing.lg }, content: { gap: spacing.md, paddingVertical: spacing.xl }, copy: { flex: 1, gap: spacing.xs }, description: { fontSize: 14, lineHeight: 21 }, hero: { gap: spacing.lg }, row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md }, segment: { borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing.md }, segments: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 } });
