import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgFlipVertical = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path
      fillRule="evenodd"
      d="M7.5 4.25a.75.75 0 0 1 .75.75v12.227l2.227-2.163a.75.75 0 1 1 1.045 1.076l-3.5 3.398a.75.75 0 0 1-1.045 0l-3.5-3.398a.75.75 0 1 1 1.045-1.076l2.228 2.162V5a.75.75 0 0 1 .75-.75zm8.477.212a.75.75 0 0 1 1.045 0l3.5 3.398a.75.75 0 0 1-1.045 1.076L17.25 6.774V19a.75.75 0 0 1-1.5 0V6.774l-2.228 2.162a.75.75 0 0 1-1.045-1.076l3.5-3.398z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgFlipVertical;
