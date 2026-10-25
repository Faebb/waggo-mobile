import Svg, { Circle, Path } from 'react-native-svg';

type Props = { color: string; size?: number };

/** Tab bar: the signed-in user's profile. */
export function UserIcon({ color, size = 20 }: Props) {
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
      <Circle cx={12} cy={8} r={3.5} />
      <Path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </Svg>
  );
}
