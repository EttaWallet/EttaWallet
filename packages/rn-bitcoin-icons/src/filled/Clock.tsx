import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgClock = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-8.5-.207V6.97a.5.5 0 1 0-1 0v5.015a.498.498 0 0 0 .146.369l2.829 2.828a.5.5 0 1 0 .707-.707L12.5 11.793z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgClock;
