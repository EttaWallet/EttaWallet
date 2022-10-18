import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgQrCode = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M5 5h4.5v4.5H5V5zm1.5 1.5V8H8V6.5H6.5zm8-1.5H19v4.5h-4.5V5zM16 6.5V8h1.5V6.5H16zm-11 8h4.5V19H5v-4.5zM6.5 16v1.5H8V16H6.5z"
      clipRule="evenodd"
    />
    <Path d="M5 11.25h1.5v1.5H5zm3 0h1.5v1.5H8zm3.167 0h1.5v1.5h-1.5zm0 3.125h1.5v1.5h-1.5zm0 3.125h1.5V19h-1.5zm0-9.375h1.5v1.5h-1.5zm0-3.125h1.5v1.5h-1.5zm3.166 6.25h1.5v1.5h-1.5zm3.167 0H19v1.5h-1.5zm-3.167 3.125h1.5v1.5h-1.5zm3.167 0H19v1.5h-1.5zM14.333 17.5h1.5V19h-1.5zm3.167 0H19V19h-1.5z" />
  </Svg>
);

export default SvgQrCode;
