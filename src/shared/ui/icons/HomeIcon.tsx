import Svg, { Path } from 'react-native-svg';

type Props = { color: string; size?: number };

/** Tab bar: the owner's home. */
export function HomeIcon({ color, size = 20 }: Props) {
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
      <Path d="M4 11.5 12 4l8 7.5" />
      <Path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </Svg>
  );
}
