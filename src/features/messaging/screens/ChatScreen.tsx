import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useWalk } from '@/features/walks';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { Banner } from '@/shared/ui/Banner';
import { EmptyState } from '@/shared/ui/EmptyState';
import { layout, radius, sizes, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { MessageBubble } from '../components/MessageBubble';
import { useChat, useSendMessage } from '../hooks/useChat';
import { PARTY_NAMES, type WalkParty } from '../model/types';

type Props = { walkId: string; viewer: WalkParty };

/**
 * RF-013: chat between the owner and the walker, like texting the driver of a ride. Open while the walk is accepted
 * or in progress; afterwards it stays readable (design proposal 07 · 20). A failed send keeps the text and offers
 * "Reintentar".
 */
export function ChatScreen({ walkId, viewer }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    screen: layout.column,
    content: { gap: spacing.md, padding: spacing.lg },
    eyebrow: { ...typography.eyebrow, color: colors.muted },
    title: { ...typography.title, color: colors.text },
    messages: { gap: spacing.sm },
    closed: { ...typography.body, color: colors.muted, textAlign: 'center' },
    composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
    input: {
      ...typography.body,
      flex: 1,
      minHeight: sizes.touch,
      maxHeight: 120,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    send: {
      minHeight: sizes.touch,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    sendText: { ...typography.subtitle, color: colors.primaryText },
    pressed: { opacity: 0.85 },
  }));
  const walk = useWalk(walkId);
  const chat = useChat(walkId);
  const send = useSendMessage(walkId);
  const [text, setText] = useState('');
  const other = PARTY_NAMES[viewer === 'Owner' ? 'Walker' : 'Owner'];
  const open = walk.data?.status === 'Accepted' || walk.data?.status === 'InProgress';

  function submit() {
    const trimmed = text.trim();
    if (trimmed === '') {
      return;
    }
    send.mutate(trimmed, { onSuccess: () => setText('') });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MENSAJES</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {other}
        </Text>

        {chat.isPending && <ActivityIndicator accessibilityLabel="Cargando mensajes" color={colors.primary} />}
        {chat.isError && (
          <Banner
            tone="danger"
            message="No pudimos cargar los mensajes."
            actionLabel="Intentar de nuevo"
            onAction={() => void chat.refetch()}
          />
        )}
        {chat.data?.length === 0 && (
          <EmptyState
            title="Coordina la recogida"
            message={`Escríbele al ${other.toLowerCase()} para ponerse de acuerdo.`}
          />
        )}
        <View style={styles.messages} accessibilityLiveRegion="polite">
          {chat.data?.map((message) => (
            <MessageBubble key={message.id} message={message} viewer={viewer} />
          ))}
        </View>
        {send.isError && <Banner tone="danger" message="No se envió." actionLabel="Reintentar" onAction={submit} />}
      </ScrollView>

      {walk.data && !open && (
        <ActionFooter>
          <Text style={styles.closed}>El paseo terminó. El chat queda solo para leer.</Text>
        </ActionFooter>
      )}
      {open && (
        <ActionFooter>
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Escribe un mensaje"
              value={text}
              onChangeText={setText}
              placeholder="Escribe un mensaje"
              placeholderTextColor={colors.muted}
              selectionColor={colors.primary}
              maxLength={1000}
              multiline
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar"
              accessibilityState={{ disabled: send.isPending }}
              disabled={send.isPending}
              onPress={submit}
              style={({ pressed }) => [styles.send, pressed && styles.pressed]}
            >
              <Text style={styles.sendText}>Enviar</Text>
            </Pressable>
          </View>
        </ActionFooter>
      )}
    </View>
  );
}
