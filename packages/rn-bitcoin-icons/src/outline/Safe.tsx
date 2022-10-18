import * as React from 'react';
import Svg, { SvgProps, Rect, Path, Circle } from 'react-native-svg';

const SvgSafe = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Rect width={13} height={13} x={5.5} y={5.5} rx={1} />
    <Rect width={9} height={9} x={7.5} y={7.5} rx={0.5} />
    <Path strokeLinecap="square" d="M8.5 19.5h-1m9 0h-1" />
    <Circle cx={12} cy={12} r={1.25} />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.5 9.5 11 11m-1.5 3.5L11 13m2 0 1.5 1.5M13 11l1.5-1.5"
    />
  </Svg>
);

export default SvgSafe;
