import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgFlipHorizontal = (props: SvgProps) => (
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
      d="M6 16.5h13M8.398 20 5 16.5 8.398 13M18 7.5H5M15.601 11 19 7.5 15.6 4"
    />
  </Svg>
);

export default SvgFlipHorizontal;
