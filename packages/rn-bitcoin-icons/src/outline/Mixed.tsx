import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgMixed = (props: SvgProps) => (
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
      d="M4 16.8c6.708.082 6.496-10.932 15.96-9.4M16.57 4 20 7.44l-3.432 3.44m.002 2.32 3.39 3.6-3.39 3.2M4 7.2c6.887-.124 6.381 11.044 15.56 9.6"
    />
  </Svg>
);

export default SvgMixed;
