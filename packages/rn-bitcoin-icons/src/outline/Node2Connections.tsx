import * as React from 'react';
import Svg, { SvgProps, Path, Circle } from 'react-native-svg';

const SvgNode2Connections = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="m13.5 7 3.5 3.5m-10 3 3.5 3.5m0-10L7 10.5m10 3L13.5 17"
    />
    <Circle cx={12} cy={5.5} r={2} />
    <Circle cx={12} cy={18.5} r={2} />
    <Circle cx={5.5} cy={12} r={2} />
    <Circle cx={18.5} cy={12} r={2} />
    <Circle cx={5.5} cy={12} r={0.5} />
    <Circle cx={12} cy={18.5} r={0.5} />
  </Svg>
);

export default SvgNode2Connections;
