import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, View } from 'react-native';

import { layout, radius, shadows, spacing, typography, useThemedStyles } from './theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  /** `false` while the confirmed action is running, so the sheet cannot be dismissed half-way. */
  dismissible?: boolean;
  /** Body and actions (e.g. a `TextField` and two `Button`s). */
  children?: ReactNode;
};

/**
 * Confirmation sheet (design proposal 03, `BottomSheet`): slides up over a `scrim`, holds a title, a short message
 * and its actions. Built on `Modal`, so a screen reader stays inside it (native window / `aria-modal` + focus trap
 * on web) and the Android back button or the Escape key on web close it through `onRequestClose`; tapping the scrim
 * closes it too, and VoiceOver's escape gesture does the same (the scrim is hidden from screen readers).
 */
export function BottomSheet({ visible, title, message, onClose, dismissible = true, children }: Props) {
  const styles = useThemedStyles((colors) => ({
    root: { flex: 1, justifyContent: 'flex-end' },
    scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.scrim },
    sheet: {
      width: '100%',
      maxWidth: layout.column.maxWidth,
      alignSelf: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      backgroundColor: colors.surface,
      ...shadows.sheet,
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.border,
    },
    title: { ...typography.title, color: colors.text },
    message: { ...typography.body, color: colors.muted },
  }));

  function requestClose() {
    if (dismissible) onClose();
  }

  return (
    <Modal
      testID="bottom-sheet"
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={requestClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          accessibilityState={{ disabled: !dismissible }}
          disabled={!dismissible}
          onPress={requestClose}
          style={styles.scrim}
        />
        <View accessibilityViewIsModal aria-modal onAccessibilityEscape={requestClose} style={styles.sheet}>
          <View style={styles.grabber} />
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {message !== undefined && <Text style={styles.message}>{message}</Text>}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
