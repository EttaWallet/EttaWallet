import * as React from 'react';
import Svg, { SvgProps, Circle, Path } from 'react-native-svg';

const SvgInfo = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Circle cx={12} cy={7.25} r={1.25} />
    <Path d="M11 10h2v8h-2z" />
  </Svg>
);

export default SvgInfo;
