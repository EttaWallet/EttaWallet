import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgUsb = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M8 7.5h8v9a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-9zm1.5-4h5v4h-5z" />
  </Svg>
);

export default SvgUsb;
