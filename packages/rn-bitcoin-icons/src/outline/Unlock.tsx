import * as React from 'react';
import Svg, { SvgProps, Rect, Path } from 'react-native-svg';

const SvgUnlock = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Rect width={14} height={10} x={5} y={10.989} rx={2} />
    <Path
      strokeLinecap="round"
      d="m15.5 8-.008-1.742a1.5 1.5 0 0 0-1.5-1.494h-3.978a1.5 1.5 0 0 0-1.5 1.5v4.73"
    />
  </Svg>
);

export default SvgUnlock;
