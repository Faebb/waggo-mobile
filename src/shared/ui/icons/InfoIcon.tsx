import Svg, { Circle, Path } from 'react-native-svg';

type Props = { color: string; size?: number };

/** Informative and success banners: a circled "i". */
export function InfoIcon({ color, size = 20 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 11v5" />
      <Path d="M12 8h.01" />
    </Svg>
  );
}
