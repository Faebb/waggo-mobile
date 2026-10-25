import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number };

/** Verified walkers (RF-002/RF-003): a shield with a check. */
export function ShieldCheckIcon({ color, size = 20 }: Props) {
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
      <Path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />
      <Path d="m9 12 2 2 4-4" />
    </Svg>
  );
}
