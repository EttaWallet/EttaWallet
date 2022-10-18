import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgArrowDown = (props: SvgProps) => (
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
      d="M12.012 3 12 20.789m7-6.777L12 21l-7-6.988"
    />
  </Svg>
);

export default SvgArrowDown;
