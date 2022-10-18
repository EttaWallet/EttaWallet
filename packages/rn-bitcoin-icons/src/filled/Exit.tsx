import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgExit = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M15.99 7.823a.75.75 0 0 1 1.061.021l3.49 3.637a.75.75 0 0 1 0 1.038l-3.49 3.637a.75.75 0 0 1-1.082-1.039l2.271-2.367h-6.967a.75.75 0 0 1 0-1.5h6.968l-2.272-2.367a.75.75 0 0 1 .022-1.06z"
      clipRule="evenodd"
    />
    <Path
      fillRule="evenodd"
      d="M3.25 4A.75.75 0 0 1 4 3.25h9.454a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0V4.75H4.75v14.5h7.954V17a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75H4a.75.75 0 0 1-.75-.75V4z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgExit;
