import * as React from 'react';
import Svg, { SvgProps, Path, Rect } from 'react-native-svg';

const SvgSharedWallet = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="square"
      strokeLinejoin="round"
      d="M15.5 8.504V4.5a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4"
    />
    <Rect width={6} height={10} x={12.5} y={10.5} rx={1} />
    <Path strokeLinecap="square" d="M13.5 18h4m-11-3h4" />
  </Svg>
);

export default SvgSharedWallet;
