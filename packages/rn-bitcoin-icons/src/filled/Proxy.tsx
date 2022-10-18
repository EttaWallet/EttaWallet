import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgProxy = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M12 6.25a.75.75 0 0 1 .75.75v10a.75.75 0 1 1-1.5 0V7a.75.75 0 0 1 .75-.75zM6.065 8.399a.75.75 0 0 1 1.06.02l2.953 3.06c.28.29.28.751 0 1.042l-2.953 3.06a.75.75 0 1 1-1.08-1.04l1.728-1.79H4a.75.75 0 1 1 0-1.5h3.773L6.046 9.458a.75.75 0 0 1 .019-1.06zm10.461 0a.75.75 0 0 1 1.06.02l2.954 3.06c.28.29.28.751 0 1.042l-2.953 3.06a.75.75 0 1 1-1.08-1.04l1.727-1.79-3.772-.001a.75.75 0 0 1 0-1.5h3.773l-1.728-1.79a.75.75 0 0 1 .02-1.061z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgProxy;
