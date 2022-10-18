import * as React from 'react';
import Svg, { SvgProps, Rect } from 'react-native-svg';

const SvgMenu = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Rect width={18} height={1.5} x={3} y={7.001} rx={0.75} />
    <Rect width={15} height={1.5} x={3} y={11.251} rx={0.75} />
    <Rect width={18} height={1.5} x={3} y={15.499} rx={0.75} />
  </Svg>
);

export default SvgMenu;
