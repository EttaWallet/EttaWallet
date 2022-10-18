import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSatoshiV2 = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M16.25 8.66h-10v-1.5h10v1.5zm-3.5-6.41v2.455h-1.5V2.25h1.5zm0 15.545v2.455h-1.5v-2.455h1.5zm3.5-5.045h-10v-1.5h10v1.5zm0 4.09h-10v-1.5h10v1.5z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgSatoshiV2;
