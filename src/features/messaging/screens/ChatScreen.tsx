import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useWalk } from '@/features/walks';
import { ActionFooter } from '@/shared/ui/ActionFooter';
import { colors, layout, radius, spacing, typography } from '@/shared/ui/theme';

import { MessageBubble } from '../components/MessageBubble';
import { useChat, useSendMessage } from '../hooks/useChat';
import { PARTY_NAMES, type WalkParty } from '../model/types';

type Props = { walkId: string; viewer: WalkParty };

/**
 * RF-013: chat between the owner and the walker, like texting the driver of a ride. Open while the walk is accepted
 * or in progress; afterwards it stays readable.
 */
export function ChatScreen({ walkId, viewer }: Props) {
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
        {chat.data?.length === 0 && <Text style={styles.empty}>Escríbele para coordinar la recogida.</Text>}
        <View style={styles.messages}>
          {chat.data?.map((message) => (
            <MessageBubble key={message.id} message={message} viewer={viewer} />
          ))}
        </View>
        {send.isError && (
          <Text accessibilityRole="alert" style={styles.error}>
            No pudimos enviar el mensaje. Intenta de nuevo.
          </Text>
        )}
      </ScrollView>

      {walk.data && !open && (
        <ActionFooter>
          <Text style={styles.closed}>El chat se cerró cuando terminó el paseo.</Text>
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

const styles = StyleSheet.create({
  screen: layout.column,
  content: { gap: spacing.md, padding: spacing.lg },
  eyebrow: { ...typography.eyebrow, color: colors.muted },
  title: { ...typography.display, color: colors.text },
  messages: { gap: spacing.sm },
  empty: { ...typography.body, color: colors.muted },
  error: { ...typography.caption, color: colors.danger },
  closed: { ...typography.body, color: colors.muted, textAlign: 'center' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    ...typography.body,
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  send: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendText: { ...typography.subtitle, color: colors.primaryText },
  pressed: { opacity: 0.85 },
});
