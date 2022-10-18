import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgQuestion = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="M9 10c0-1.358 1.15-3 3-3s3 1.596 3 3c0 2.175-3 2.059-3 4.5m0 3v-1"
    />
  </Svg>
);

export default SvgQuestion;
