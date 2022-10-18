import * as React from 'react';
import Svg, { SvgProps, Rect } from 'react-native-svg';

const SvgDevices = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Rect width={9} height={15} x={7.5} y={4.5} rx={1.5} />
    <Rect width={5} height={5} x={9.5} y={6.5} rx={0.75} />
    <Rect
      width={1.5}
      height={1}
      rx={0.5}
      transform="matrix(1 0 0 -1 9.5 14.5)"
    />
    <Rect
      width={1.5}
      height={1}
      rx={0.5}
      transform="matrix(1 0 0 -1 13 14.5)"
    />
  </Svg>
);

export default SvgDevices;
