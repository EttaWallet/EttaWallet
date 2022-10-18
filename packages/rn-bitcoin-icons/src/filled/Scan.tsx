import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgScan = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M18.25 14a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1 0-1.5h2.75v-2.75a.75.75 0 0 1 .75-.75zm-12.5 0a.75.75 0 0 1 .75.75v2.75h2.75a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75v-3.5a.75.75 0 0 1 .75-.75zM14 5.75a.75.75 0 0 1 .75-.75h3.496a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.5H14.75a.75.75 0 0 1-.75-.75zm-9 0A.75.75 0 0 1 5.75 5h3.5a.75.75 0 0 1 0 1.5H6.5v2.75a.75.75 0 0 1-1.5 0v-3.5z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgScan;
