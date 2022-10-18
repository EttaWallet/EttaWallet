import * as React from 'react';
import Svg, { SvgProps, Circle } from 'react-native-svg';

const SvgEllipsis = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Circle cx={7} cy={12} r={1} />
    <Circle cx={12.5} cy={12} r={1} />
    <Circle cx={18} cy={12} r={1} />
  </Svg>
);

export default SvgEllipsis;
