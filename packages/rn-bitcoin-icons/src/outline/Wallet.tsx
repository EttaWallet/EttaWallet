import * as React from 'react';
import Svg, { SvgProps, Path, Rect, Circle } from 'react-native-svg';

const SvgWallet = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M15 17.5h3.005a1.5 1.5 0 0 0 1.5-1.5V8a1.5 1.5 0 0 0-1.5-1.5H15A1.5 1.5 0 0 1 16.5 8v8a1.5 1.5 0 0 1-1.5 1.5z" />
    <Rect width={12} height={11} x={4.5} y={6.5} rx={1.5} />
    <Circle cx={8.75} cy={11.75} r={1.25} />
  </Svg>
);

export default SvgWallet;
