import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgReceive = (props: SvgProps) => (
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
      d="M5 15.747V18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.253M12.202 13.5V5m3.344 6.15-3.344 3.266-3.344-3.266"
    />
  </Svg>
);

export default SvgReceive;
