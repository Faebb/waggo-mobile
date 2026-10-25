import Svg, { Circle, Path } from 'react-native-svg';

type Props = { color: string; size?: number };

/** Live walk (RF-008): a route with a pin at the end. */
export function MapRouteIcon({ color, size = 20 }: Props) {
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
      <Path d="M4 18c3 0 3-4 6-4s3 4 6 4" />
      <Path d="M18 4a3 3 0 0 1 3 3c0 2.2-3 5-3 5s-3-2.8-3-5a3 3 0 0 1 3-3z" />
      <Circle cx={18} cy={7} r={1} fill={color} stroke="none" />
    </Svg>
  );
}
