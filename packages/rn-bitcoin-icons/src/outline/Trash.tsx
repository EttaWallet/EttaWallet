import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgTrash = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M6.6 6.91 8.4 20h7.2l1.8-13.09" />
    <Path strokeLinecap="round" d="M6 6.667h12" />
    <Path d="M14.571 7V6a2 2 0 0 0-2-2H11.43a2 2 0 0 0-2 2v1" />
    <Path
      strokeLinecap="round"
      d="M11.98 10.546v5.819m-2.38-5.82.6 5.82m4.2-5.819-.6 5.819"
    />
  </Svg>
);

export default SvgTrash;
