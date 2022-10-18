import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCross = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M5.47 5.47a.75.75 0 0 1 1.06 0l12 12a.75.75 0 1 1-1.06 1.06l-12-12a.75.75 0 0 1 0-1.06z"
      clipRule="evenodd"
    />
    <Path
      fillRule="evenodd"
      d="M18.53 5.47a.75.75 0 0 1 0 1.06l-12 12a.75.75 0 0 1-1.06-1.06l12-12a.75.75 0 0 1 1.06 0z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgCross;
