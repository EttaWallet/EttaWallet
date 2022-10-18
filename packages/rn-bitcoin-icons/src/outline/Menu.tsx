import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgMenu = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path strokeLinecap="round" d="M3.5 7.5h17M3.5 12h14m-14 4.5h17" />
  </Svg>
);

export default SvgMenu;
