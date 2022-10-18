import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSdCard = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="m6.5 8.5 4-4H16A1.5 1.5 0 0 1 17.5 6v12a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 18V8.5z" />
    <Path strokeLinecap="round" d="M11.5 7v3m2-3v3m2-3v3" />
  </Svg>
);

export default SvgSdCard;
