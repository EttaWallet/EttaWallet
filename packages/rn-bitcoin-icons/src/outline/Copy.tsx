import * as React from 'react';
import Svg, { SvgProps, Rect, Path } from 'react-native-svg';

const SvgCopy = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Rect width={9} height={13} x={6.5} y={6.5} rx={1.5} />
    <Path d="M8.5 6A1.5 1.5 0 0 1 10 4.5h6A1.5 1.5 0 0 1 17.5 6v10a1.5 1.5 0 0 1-1.5 1.5" />
  </Svg>
);

export default SvgCopy;
