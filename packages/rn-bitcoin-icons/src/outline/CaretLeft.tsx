import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCaretLeft = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="m14.071 5-6.364 6.364a1 1 0 0 0 0 1.414l6.364 6.364"
    />
  </Svg>
);

export default SvgCaretLeft;
