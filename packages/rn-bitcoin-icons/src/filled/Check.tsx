import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCheck = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M18.381 5.354a.75.75 0 0 1 .265 1.027l-7.087 12a.75.75 0 0 1-1.164.16L5.48 13.838a.75.75 0 0 1 1.038-1.084l4.23 4.051L17.353 5.62a.75.75 0 0 1 1.027-.265z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgCheck;
