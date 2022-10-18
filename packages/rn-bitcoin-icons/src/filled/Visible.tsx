import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgVisible = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <Path
      fillRule="evenodd"
      d="M21 12c0 2.761-4.03 5-9 5s-9-2.239-9-5 4.03-5 9-5 9 2.239 9 5zm-5 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgVisible;
