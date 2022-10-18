import * as React from 'react';
import Svg, { SvgProps, Circle, Path } from 'react-native-svg';

const SvgAlert = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Circle cx={12} cy={16.75} r={1.25} />
    <Path d="M11 6h2v8h-2z" />
  </Svg>
);

export default SvgAlert;
