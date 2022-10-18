import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgMagicWand = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="m14.75 12.746-7 7.004a2.475 2.475 0 1 1-3.5-3.5l7.002-7.002a2.474 2.474 0 0 1 3.498 3.498zm-4.717-2.231 3.451 3.451" />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 13.25v3.5M19.75 15h-3.5M17 4.25v3.5M18.75 6h-3.5M7 5.25v3.5M8.75 7h-3.5"
    />
  </Svg>
);

export default SvgMagicWand;
