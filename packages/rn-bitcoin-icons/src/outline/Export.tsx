import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgExport = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      d="M12 7.5H7A1.5 1.5 0 0 0 5.5 9v8A1.5 1.5 0 0 0 7 18.5h8a1.5 1.5 0 0 0 1.5-1.5v-5"
    />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m12.5 11.5 6.364-6.364M14.5 4.5h5v5"
    />
  </Svg>
);

export default SvgExport;
