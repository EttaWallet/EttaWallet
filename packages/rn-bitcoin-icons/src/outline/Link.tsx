import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgLink = (props: SvgProps) => (
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
      d="M5.576 13.481a3.5 3.5 0 0 0 4.95 4.95m2.473-7.423a3.5 3.5 0 0 1 0 4.95l-2.475 2.475m-2.475-7.425-2.475 2.475m12.857-2.957a3.5 3.5 0 1 0-4.95-4.95M11.008 13a3.5 3.5 0 0 1 0-4.95l2.475-2.475M15.958 13l2.475-2.475"
    />
  </Svg>
);

export default SvgLink;
