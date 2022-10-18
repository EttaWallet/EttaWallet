import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSdCard = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="m6 9 5-5h5.5A1.5 1.5 0 0 1 18 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18.5V9zm9.75-3a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5a.75.75 0 0 0-.75-.75zM13 6.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0v-2.5zM11.75 6a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5a.75.75 0 0 0-.75-.75z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgSdCard;
