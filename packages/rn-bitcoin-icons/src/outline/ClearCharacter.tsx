import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgClearCharacter = (props: SvgProps) => (
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
      d="m7.5 5.5-3.447 5.29a1.641 1.641 0 0 0-.043 1.723L7.5 18.5h11.36a1.64 1.64 0 0 0 1.64-1.641V7.14a1.64 1.64 0 0 0-1.64-1.641H7.5zm2.5 3 7 7m-7 0 6.93-7"
    />
  </Svg>
);

export default SvgClearCharacter;
