import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgHidden = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="M10.563 16.436c.467.042.947.064 1.437.064 4.694 0 8.5-2.015 8.5-4.5 0-1.213-.906-2.313-2.379-3.122m-4.685-1.314A16.019 16.019 0 0 0 12 7.5c-4.694 0-8.5 2.015-8.5 4.5 0 1.212.905 2.312 2.376 3.121"
    />
    <Path strokeLinecap="round" strokeLinejoin="round" d="M19 5 5 19" />
  </Svg>
);

export default SvgHidden;
