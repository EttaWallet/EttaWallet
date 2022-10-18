import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgSatoshiV1 = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17zM8.86 8.011l7.639 2.063m-3.41-2.804.406-1.774m-2.992 13.008.408-1.773M8.18 10.969l7.636 2.066m-8.316.89 7.638 2.064" />
  </Svg>
);

export default SvgSatoshiV1;
