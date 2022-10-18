import * as React from 'react';
import Svg, { SvgProps, Circle, Path } from 'react-native-svg';

const SvgCart = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Circle cx={10} cy={19} r={1.5} />
    <Circle cx={17} cy={19} r={1.5} />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.5 4h2l3.504 11H17"
    />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.224 12.5 6.3 6.5h12.507a.5.5 0 0 1 .475.658l-1.667 5a.5.5 0 0 1-.474.342H8.224z"
    />
  </Svg>
);

export default SvgCart;
