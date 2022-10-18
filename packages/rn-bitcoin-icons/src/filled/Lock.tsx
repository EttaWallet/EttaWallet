import * as React from 'react';
import Svg, { SvgProps, Rect, Path } from 'react-native-svg';

const SvgLock = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Rect width={14} height={10} x={5} y={11} rx={2} />
    <Path
      fillRule="evenodd"
      d="M9.5 6.75a.25.25 0 0 0-.25.25v5h-1.5V7c0-.966.784-1.75 1.75-1.75h5c.966 0 1.75.784 1.75 1.75v5h-1.5V7a.25.25 0 0 0-.25-.25h-5z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgLock;
