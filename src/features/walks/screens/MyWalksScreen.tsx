import { ScrollView, Text, View } from 'react-native';

import { useMyPets } from '@/features/pets';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { layout, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { WalkRow } from '../components/WalkRow';
import { useMyWalks } from '../hooks/useWalks';
import type { Walk, WalkStatus } from '../model/types';

type Props = { onOpenWalk: (id: string) => void; onRequestWalk: () => void };

/** Sections of the list (design proposal 07 · 19), in the order they are shown. */
const SECTIONS: { title: string; statuses: readonly WalkStatus[] }[] = [
  { title: 'EN CURSO', statuses: ['InProgress'] },
  { title: 'PROGRAMADOS', statuses: ['Requested', 'Accepted'] },
  { title: 'HISTORIAL', statuses: ['Completed', 'Cancelled'] },
];

/** Row-shaped placeholder matching `WalkRow`, shown three times while the list loads. */
function WalkRowSkeleton() {
  const styles = useThemedStyles(() => ({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
    body: { flex: 1, gap: spacing.xs },
  }));
  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Skeleton width={140} height={16} />
        <Skeleton width={100} height={14} />
      </View>
      <Skeleton width={60} height={16} />
    </View>
  );
}

/** RF-007: the owner's walks (design proposal 07 · 19): in progress, scheduled and history, newest first. */
export function MyWalksScreen({ onOpenWalk, onRequestWalk }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.lg, padding: spacing.lg },
    title: { ...typography.title, color: colors.text },
    section: { gap: spacing.xs },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
  }));
  const walks = useMyWalks();
  const pets = useMyPets();
  const inSection = (statuses: readonly WalkStatus[]): Walk[] =>
    walks.data?.filter((walk) => statuses.includes(walk.status)) ?? [];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Mis paseos
        </Text>

        {walks.isPending && (
          <View>
            <WalkRowSkeleton />
            <WalkRowSkeleton />
            <WalkRowSkeleton />
          </View>
        )}
        {walks.isError && <ErrorState message="No pudimos cargar tus paseos." onRetry={() => void walks.refetch()} />}
        {walks.data?.length === 0 && (
          <EmptyState
            title="Aún no has pedido paseos"
            message="Pide el primero y síguelo en vivo."
            actionLabel="Pedir un paseo"
            onAction={onRequestWalk}
          />
        )}
        {SECTIONS.map(({ title, statuses }) => {
          const list = inSection(statuses);
          if (list.length === 0) return null;
          return (
            <View key={title} style={styles.section}>
              <Text style={styles.eyebrow}>{title}</Text>
              {list.map((walk) => (
                <WalkRow key={walk.id} walk={walk} pets={pets.data ?? []} onPress={() => onOpenWalk(walk.id)} />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
