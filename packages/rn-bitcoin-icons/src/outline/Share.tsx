import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgShare = (props: SvgProps) => (
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
      d="M20.5 3.5 3.5 9l6.5 3 7-5-5 7 3 6.5 5.5-17z"
    />
  </Svg>
);

export default SvgShare;
