import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgAlert = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path strokeLinecap="round" d="M12 7v7m0 3.5v-1" />
  </Svg>
);

export default SvgAlert;
