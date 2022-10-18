import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgCart = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M9.5 19.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm7-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM3 4a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .476.348L9.37 14.5H17a.5.5 0 0 1 0 1H9.004a.5.5 0 0 1-.476-.348L5.135 4.5H3.5A.5.5 0 0 1 3 4z"
      clipRule="evenodd"
    />
    <Path d="M8.5 13 6 6h13.337a.5.5 0 0 1 .48.637l-1.713 6a.5.5 0 0 1-.481.363H8.5z" />
  </Svg>
);

export default SvgCart;
