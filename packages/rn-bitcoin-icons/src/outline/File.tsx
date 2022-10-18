import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgFile = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M13.5 4.5H8A1.5 1.5 0 0 0 6.5 6v12A1.5 1.5 0 0 0 8 19.5h8a1.5 1.5 0 0 0 1.5-1.5V8.504l-4-4.004z" />
    <Path strokeLinecap="round" strokeLinejoin="round" d="M13 5v4h4" />
  </Svg>
);

export default SvgFile;
