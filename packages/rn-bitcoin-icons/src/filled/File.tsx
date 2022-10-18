import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgFile = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M13 4H7.5A1.5 1.5 0 0 0 6 5.5v13A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V9h-.004L13 4zm-1 1.604V9.75c0 .138.112.25.25.25h4.146a.25.25 0 0 0 .177-.427l-4.146-4.146a.25.25 0 0 0-.427.177z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgFile;
