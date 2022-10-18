import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCar = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M18.5 5.51c-.2-.59-.59-1.01-1.25-1.01H6.75c-.66 0-1.04.42-1.25 1.01l-2 5.74v7.5c0 .55.2.75.75.75h.5c.55 0 .75-.2.75-.75V17.5h13v1.25c0 .55.2.75.75.75h.5c.55 0 .75-.2.75-.75v-7.5l-2-5.74z" />
    <Path d="M6.5 14.5a1 1 0 1 1 0-2 1 1 0 1 1 0 2zm11 0a1 1 0 1 1 0-2 1 1 0 1 1 0 2z" />
    <Path strokeLinejoin="round" d="M5.75 9.5 7 6h10l1.25 3.5H5.75z" />
  </Svg>
);

export default SvgCar;
