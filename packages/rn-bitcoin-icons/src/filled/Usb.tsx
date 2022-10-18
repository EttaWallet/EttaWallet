import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgUsb = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M7.5 7h9v9.5a4.5 4.5 0 1 1-9 0V7z" />
    <Path
      fillRule="evenodd"
      d="M9 3h6v5H9V3zm1 1v3h4V4h-4z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgUsb;
