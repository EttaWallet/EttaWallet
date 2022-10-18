import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgExit = (props: SvgProps) => (
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
      d="M19.285 12h-8.012m5.237 3.636L20 12l-3.49-3.636M13.454 7V4H4v16h9.454v-3"
    />
  </Svg>
);

export default SvgExit;
