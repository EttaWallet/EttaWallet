import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSend = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M5 14.997a.75.75 0 0 1 .75.75V18c0 .138.112.25.25.25h12a.25.25 0 0 0 .25-.25v-2.253a.75.75 0 0 1 1.5 0V18A1.75 1.75 0 0 1 18 19.75H6A1.75 1.75 0 0 1 4.25 18v-2.253a.75.75 0 0 1 .75-.75z"
      clipRule="evenodd"
    />
    <Path
      fillRule="evenodd"
      d="M12.202 5.58a.75.75 0 0 1 .75.75v8.086a.75.75 0 0 1-1.5 0V6.331a.75.75 0 0 1 .75-.75z"
      clipRule="evenodd"
    />
    <Path
      fillRule="evenodd"
      d="M11.678 4.464a.75.75 0 0 1 1.048 0L16.07 7.73a.75.75 0 0 1-1.048 1.073l-2.82-2.754-2.82 2.754A.75.75 0 1 1 8.334 7.73l3.344-3.266z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgSend;
