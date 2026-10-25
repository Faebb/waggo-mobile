import Svg, { Circle } from 'react-native-svg';

type Props = { color: string; size?: number };

/** The Waggo mark (vault › Sistema de diseño Seashell & Sapphire): a pad and four toes. */
export function PawIcon({ color, size = 20 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <Circle cx={12} cy={15.5} r={3.6} />
      <Circle cx={6} cy={10} r={1.8} />
      <Circle cx={9.5} cy={6} r={1.8} />
      <Circle cx={14.5} cy={6} r={1.8} />
      <Circle cx={18} cy={10} r={1.8} />
    </Svg>
  );
}
