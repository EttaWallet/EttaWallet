import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgEdit = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M3.995 17.207V19.5a.5.5 0 0 0 .5.5h2.298a.5.5 0 0 0 .353-.146l9.448-9.448-3-3-9.452 9.448a.5.5 0 0 0-.147.353zm10.837-11.04 3 3 1.46-1.46a1 1 0 0 0 0-1.414l-1.585-1.586a1 1 0 0 0-1.414 0l-1.46 1.46z" />
  </Svg>
);

export default SvgEdit;
