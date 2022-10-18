import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgProxy = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path strokeLinecap="round" d="M12 17V7" />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.934 12H4m2.585 3.061L9.538 12 6.585 8.939M19.395 12h-4.933m2.585 3.061L20 12l-2.953-3.061"
    />
  </Svg>
);

export default SvgProxy;
