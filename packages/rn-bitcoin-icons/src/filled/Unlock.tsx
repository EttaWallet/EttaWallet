import * as React from 'react';
import Svg, { SvgProps, Rect, Path } from 'react-native-svg';

const SvgUnlock = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Rect width={14} height={10} x={5} y={11.225} rx={2} />
    <Path
      fillRule="evenodd"
      d="M10 5.75a.75.75 0 0 0-.75.75V12a.75.75 0 0 1-1.5 0V6.5A2.25 2.25 0 0 1 10 4.25h4a2.25 2.25 0 0 1 2.25 2.25v2.522a.75.75 0 0 1-1.5 0V6.5a.75.75 0 0 0-.75-.75h-4z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgUnlock;
