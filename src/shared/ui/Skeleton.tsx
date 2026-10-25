import { useEffect, useState } from 'react';
import { Animated, type DimensionValue } from 'react-native';

import { radius, useColors } from './theme';

type Props = {
  width: DimensionValue;
  height: number;
  radius?: number;
};

/** Placeholder with the shape of the content it stands in for, pulsing while that content loads (ADR-019). */
export function Skeleton({ width, height, radius: cornerRadius = radius.sm }: Props) {
  const colors = useColors();
  const [opacity] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width, height, borderRadius: cornerRadius, backgroundColor: colors.border, opacity }}
    />
  );
}
