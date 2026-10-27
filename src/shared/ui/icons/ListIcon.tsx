import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number };

/** A list of walks (walker's "Paseos" tab, ADR-019 as amended by the design proposal). */
export function ListIcon({ color, size = 20 }: Props) {
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
      <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Svg>
  );
}
