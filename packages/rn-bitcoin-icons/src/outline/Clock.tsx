import * as React from 'react';
import Svg, { SvgProps, Circle, Path } from 'react-native-svg';

const SvgClock = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Circle cx={12} cy={12} r={8.5} />
    <Path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l2.8 2.8" />
  </Svg>
);

export default SvgClock;
