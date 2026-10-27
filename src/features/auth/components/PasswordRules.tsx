import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { radius, spacing, typography, useColors, useThemedStyles } from '@/shared/ui/theme';

import { PASSWORD_RULES } from '../model/passwordRules';

type Props = { password: string };

/** Live checklist under the password (design proposal screen 3): a check plus "cumplida/pendiente", not only color. */
export function PasswordRules({ password }: Props) {
  const colors = useColors();
  const styles = useThemedStyles((colors) => ({
    list: { gap: spacing.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    mark: {
      width: 20,
      height: 20,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
    },
    markMet: { backgroundColor: colors.success, borderColor: colors.success },
    label: { ...typography.caption, color: colors.muted },
    labelMet: { color: colors.text },
  }));

  return (
    <View style={styles.list}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <View
            key={rule.label}
            accessible
            accessibilityLabel={`${rule.label}: ${met ? 'cumplida' : 'pendiente'}`}
            style={styles.row}
          >
            <View style={[styles.mark, met && styles.markMet]}>
              {met && (
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden>
                  <Path
                    d="m5 12 5 5 9-10"
                    stroke={colors.surface}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>
            <Text style={[styles.label, met && styles.labelMet]}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
