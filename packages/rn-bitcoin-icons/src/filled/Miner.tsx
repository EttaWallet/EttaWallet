import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgMiner = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M5.642 18.37a1.224 1.224 0 0 1 0-1.74A8.972 8.972 0 0 1 12 14a8.971 8.971 0 0 1 6.358 2.63 1.224 1.224 0 0 1 0 1.74A8.972 8.972 0 0 1 12 21a8.972 8.972 0 0 1-6.358-2.63z" />
    <Path
      fillRule="evenodd"
      d="M8.5 7.5h7V8h.5c0 2.637-1.681 5-4 5s-4-2.363-4-5h.5v-.5zm.523 1C9.213 10.568 10.566 12 12 12s2.787-1.432 2.977-3.5H9.023z"
      clipRule="evenodd"
    />
    <Path
      fillRule="evenodd"
      d="M12 3c2.485 0 4.5 2.239 4.5 5h-9c0-2.761 2.015-5 4.5-5zm0 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-5.5 1A.5.5 0 0 1 7 8h10a.5.5 0 1 1 0 1H7a.5.5 0 0 1-.5-.5z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgMiner;
