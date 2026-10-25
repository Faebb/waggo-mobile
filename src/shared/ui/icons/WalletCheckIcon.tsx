import Svg, { Path, Rect } from 'react-native-svg';

type Props = { color: string; size?: number };

/** Payment released only when the walk ends well (RF-015–RF-018): a wallet with a check. */
export function WalletCheckIcon({ color, size = 20 }: Props) {
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
      <Rect x={3} y={6} width={18} height={13} rx={2} />
      <Path d="M3 10h18" />
      <Path d="m9 15 2 2 4-4" />
    </Svg>
  );
}
