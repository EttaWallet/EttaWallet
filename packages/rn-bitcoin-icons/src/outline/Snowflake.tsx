import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSnowflake = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4v16m8-8H4m14.5-3.514-3.5 3.5 3.5 3.5m-13 0 3.5-3.5-3.5-3.5m10 10-3.5-3.5-3.5 3.5m0-13 3.5 3.5 3.5-3.5"
    />
  </Svg>
);

export default SvgSnowflake;
