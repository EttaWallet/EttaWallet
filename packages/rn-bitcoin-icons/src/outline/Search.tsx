import * as React from 'react';
import Svg, { SvgProps, Circle, Path } from 'react-native-svg';

const SvgSearch = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Circle cx={11} cy={11} r={5.5} />
    <Path strokeLinecap="round" strokeLinejoin="round" d="m15 15 4 4" />
  </Svg>
);

export default SvgSearch;
