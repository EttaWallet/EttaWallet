import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgMinus = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path strokeLinecap="round" d="M19.5 12h-15" />
  </Svg>
);

export default SvgMinus;
