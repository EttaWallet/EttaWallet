import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSatoshiV2 = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M7 7.91h10m-5-2.455V3m0 18v-2.455M7 12h10M7 16.09h10" />
  </Svg>
);

export default SvgSatoshiV2;
