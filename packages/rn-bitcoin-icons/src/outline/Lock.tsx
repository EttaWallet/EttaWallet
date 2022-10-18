import * as React from 'react';
import Svg, { SvgProps, Rect, Path } from 'react-native-svg';

const SvgLock = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Rect width={14} height={10} x={5} y={10.968} rx={2} />
    <Path d="M15.486 10.984V7.243a1.5 1.5 0 0 0-1.5-1.5h-3.972a1.5 1.5 0 0 0-1.5 1.5v3.74" />
  </Svg>
);

export default SvgLock;
