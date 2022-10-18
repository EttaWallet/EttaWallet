import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCaretRight = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="m9.929 4.858 6.364 6.364a1 1 0 0 1 0 1.414L9.929 19"
    />
  </Svg>
);

export default SvgCaretRight;
