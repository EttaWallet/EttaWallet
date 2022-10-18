import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgQrCode = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinejoin="round"
      d="M5.5 15H9v3.5H5.5zM15 5.5h3.5V9H15zm-9.5 0H9V9H5.5zm6.25 0h.5V6h-.5zm0 3.125h.5v.5h-.5zM8.625 11.75h.5v.5h-.5zm3.125 3.125h.5v.5h-.5zm0 3.125h.5v.5h-.5zM5.5 11.75H6v.5h-.5zm6.25 0h.5v.5h-.5zm3.125 0h.5v.5h-.5zm3.125 0h.5v.5H18zm-3.125 3.125h.5v.5h-.5zm3.125 0h.5v.5H18zM14.875 18h.5v.5h-.5zM18 18h.5v.5H18z"
    />
  </Svg>
);

export default SvgQrCode;
