import * as React from 'react';
import Svg, { SvgProps, Circle } from 'react-native-svg';

const SvgEllipsis = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Circle cx={6.5} cy={12} r={1.5} />
    <Circle cx={12} cy={12} r={1.5} />
    <Circle cx={17.5} cy={12} r={1.5} />
  </Svg>
);

export default SvgEllipsis;
