import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCaretUp = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="m5 14.071 6.364-6.364a1 1 0 0 1 1.414 0l6.364 6.364"
    />
  </Svg>
);

export default SvgCaretUp;
