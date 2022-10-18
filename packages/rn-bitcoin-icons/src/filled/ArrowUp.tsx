import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgArrowUp = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M11.47 2.47a.75.75 0 0 1 1.06 0l7 6.987a.75.75 0 1 1-1.06 1.061L12.751 4.81 12.762 21a.75.75 0 0 1-1.5.002l-.01-16.194-5.722 5.711a.75.75 0 1 1-1.06-1.061l7-6.988z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgArrowUp;
