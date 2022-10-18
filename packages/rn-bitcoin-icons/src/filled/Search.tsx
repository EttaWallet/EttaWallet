import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSearch = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M10.5 5.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm-6.5 5a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z"
      clipRule="evenodd"
    />
    <Path
      fillRule="evenodd"
      d="M14.47 14.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgSearch;
