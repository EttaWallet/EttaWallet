import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgArrowUp = (props: SvgProps) => (
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
      d="M12.012 21 12 3.211m7 6.777L12 3 5 9.988"
    />
  </Svg>
);

export default SvgArrowUp;
