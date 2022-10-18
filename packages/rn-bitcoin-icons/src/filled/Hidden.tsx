import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgHidden = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M14.33 7.17A15.642 15.642 0 0 0 12 7c-4.97 0-9 2.239-9 5 0 1.44 1.096 2.738 2.85 3.65l2.362-2.362a4 4 0 0 1 5.076-5.076l1.043-1.043zm-3.1 8.756a4 4 0 0 0 4.695-4.695l2.648-2.647C20.078 9.478 21 10.68 21 12c0 2.761-4.03 5-9 5-.598 0-1.183-.032-1.749-.094l.98-.98zm6.563-10.719a1 1 0 1 1 1.414 1.414L6.48 19.35a1 1 0 1 1-1.414-1.414L17.793 5.207z" />
  </Svg>
);

export default SvgHidden;
