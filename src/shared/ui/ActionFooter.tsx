import type { ReactNode } from 'react';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native';

import { spacing, useThemedStyles } from './theme';

type Props = { children: ReactNode };

/**
 * Bottom area of a screen with its main actions, within thumb reach (ADR-013). It rises with the keyboard. The
 * keyboard-controller version is used because React Native's own KeyboardAvoidingView does not follow the keyboard on
 * Android in edge-to-edge mode (Expo SDK 57 default), which left the button hidden behind the keyboard.
 */
export function ActionFooter({ children }: Props) {
  const styles = useThemedStyles((colors) => ({
    footer: {
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  }));

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.footer}>
      {children}
    </KeyboardAvoidingView>
  );
}
