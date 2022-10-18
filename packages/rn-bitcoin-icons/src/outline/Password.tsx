import * as React from 'react';
import Svg, { SvgProps, Rect, Circle } from 'react-native-svg';

const SvgPassword = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Rect
      width={17}
      height={9}
      x={3.5}
      y={7.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      rx={0.5}
    />
    <Circle
      cx={7}
      cy={12}
      r={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={12}
      cy={12}
      r={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx={17}
      cy={12}
      r={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgPassword;
