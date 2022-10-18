import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgArrowRight = (props: SvgProps) => (
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
      d="M3 12.012 20.789 12m-6.777 7L21 12l-6.988-7"
    />
  </Svg>
);

export default SvgArrowRight;
