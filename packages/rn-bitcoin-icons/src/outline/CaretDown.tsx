import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCaretDown = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="m19.142 9.929-6.364 6.364a1 1 0 0 1-1.415 0L5 9.929"
    />
  </Svg>
);

export default SvgCaretDown;
