import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCross = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path strokeLinecap="round" d="m6 6 12 12m0-12L6 18" />
  </Svg>
);

export default SvgCross;
