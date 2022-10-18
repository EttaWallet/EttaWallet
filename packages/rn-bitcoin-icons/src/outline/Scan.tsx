import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgScan = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.5 15v3.5H15m-6 0H5.5V15M15 5.5h3.496V9M9 5.5H5.5V9"
    />
  </Svg>
);

export default SvgScan;
