import * as React from 'react';
import Svg, { SvgProps, Path, Circle } from 'react-native-svg';

const SvgNode = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="m12.31 4.815 7.496 7.496-7.495 7.495-7.496-7.495 7.496-7.496zm-5.373 7.496 5.374 5.374 5.374-5.374-5.374-5.374-5.374 5.374z"
      clipRule="evenodd"
    />
    <Circle cx={12} cy={5.5} r={2.5} />
    <Circle cx={12} cy={18.5} r={2.5} />
    <Circle cx={5.5} cy={12} r={2.5} />
    <Circle cx={18.5} cy={12} r={2.5} />
  </Svg>
);

export default SvgNode;
