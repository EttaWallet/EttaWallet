import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgGrid = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M5 10.2V5.8a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8H5.8a.8.8 0 0 1-.8-.8zm8 0V5.8a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8h-4.4a.8.8 0 0 1-.8-.8zm0 8v-4.4a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8h-4.4a.8.8 0 0 1-.8-.8zm-8 0v-4.4a.8.8 0 0 1 .8-.8h4.4a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8H5.8a.8.8 0 0 1-.8-.8z" />
  </Svg>
);

export default SvgGrid;
