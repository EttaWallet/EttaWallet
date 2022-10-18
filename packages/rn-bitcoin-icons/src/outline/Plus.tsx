import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgPlus = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path strokeLinecap="round" d="M12 3.5v17m8.5-8.5h-17" />
  </Svg>
);

export default SvgPlus;
