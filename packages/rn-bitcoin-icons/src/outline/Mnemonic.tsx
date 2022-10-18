import * as React from 'react';
import Svg, { SvgProps, Rect, Path } from 'react-native-svg';

const SvgMnemonic = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Rect width={13} height={13} x={5.5} y={5.5} rx={1} />
    <Path
      strokeLinecap="round"
      d="M15 16h1.5m-5 0H13m-5 0h1.5m5.5-2.667h1.5m-5 0H13m-5 0h1.5m5.5-2.666h1.5m-5 0H13m-5 0h1.5M15 8h1.5m-5 0H13M8 8h1.5"
    />
  </Svg>
);

export default SvgMnemonic;
