import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgConsole = (props: SvgProps) => (
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
      d="M10 19h10.5M3.5 5l7 7-7 7"
    />
  </Svg>
);

export default SvgConsole;
