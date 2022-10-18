import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgMinus = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M4.85 11.25h14.302a.75.75 0 1 1 0 1.5H4.85a.75.75 0 0 1 0-1.5z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgMinus;
