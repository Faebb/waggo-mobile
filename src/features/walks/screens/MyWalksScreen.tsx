import { ScrollView, Text, View } from 'react-native';

import { useMyPets } from '@/features/pets';
import { Skeleton } from '@/shared/ui/Skeleton';
import { layout, radius, spacing, typography, useThemedStyles } from '@/shared/ui/theme';

import { WalkRow } from '../components/WalkRow';
import { useMyWalks } from '../hooks/useWalks';

type Props = { onOpenWalk: (id: string) => void };

/** Row-shaped placeholder matching `WalkRow`, shown three times while the list loads. */
function WalkRowSkeleton() {
  const styles = useThemedStyles((colors) => ({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
    body: { flex: 1, gap: spacing.xs },
    hairline: { borderTopWidth: 1, borderTopColor: colors.border },
  }));
  return (
    <View style={[styles.row, styles.hairline]}>
      <Skeleton width={10} height={10} radius={radius.pill} />
      <View style={styles.body}>
        <Skeleton width={140} height={16} />
        <Skeleton width={100} height={14} />
      </View>
      <Skeleton width={60} height={16} />
    </View>
  );
}

/** RF-007: the owner's walks, newest first. */
export function MyWalksScreen({ onOpenWalk }: Props) {
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.md, padding: spacing.lg },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.display, color: colors.text, marginBottom: spacing.md },
    error: { ...typography.body, color: colors.danger },
    empty: { ...typography.body, color: colors.muted },
  }));
  const walks = useMyWalks();
  const pets = useMyPets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>HISTORIAL</Text>
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
        {walks.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos cargar tus paseos. Intenta de nuevo.
          </Text>
        )}
        {walks.data?.length === 0 && <Text style={styles.empty}>Aún no has pedido paseos.</Text>}
        {walks.data && walks.data.length > 0 && (
          <View>
            {walks.data.map((walk) => (
              <WalkRow key={walk.id} walk={walk} pets={pets.data ?? []} onPress={() => onOpenWalk(walk.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
