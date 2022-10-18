import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgInfo = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path strokeLinecap="round" d="M12 10.5v7M12 8V7" />
  </Svg>
);

export default SvgInfo;
