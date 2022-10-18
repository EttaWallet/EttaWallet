import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgArrowLeft = (props: SvgProps) => (
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
      d="M21 12.012 3.211 12m6.777 7L3 12l6.988-7"
    />
  </Svg>
);

export default SvgArrowLeft;
