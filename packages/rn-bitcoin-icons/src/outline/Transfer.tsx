import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgTransfer = (props: SvgProps) => (
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
      d="M4 15.993V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3.007m-.648-4.557-3.047 3.198-3.048-3.198"
    />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.4 13.958V8.952A4.952 4.952 0 0 1 11.352 4v0a4.952 4.952 0 0 1 4.953 4.952v5.006"
    />
  </Svg>
);

export default SvgTransfer;
