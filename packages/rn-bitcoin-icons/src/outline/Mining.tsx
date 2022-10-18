import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgMining = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12.265 3.703c-2.536-.225-4.88.459-6.423 1.79-.19.164-.02.443.226.385 1.717-.41 3.67-.494 5.704-.197l.493-1.978zm2.903 2.824c1.935.693 3.62 1.685 4.944 2.853.189.166.472 0 .38-.235-.736-1.899-2.486-3.603-4.83-4.595l-.494 1.977zm-2.687-.591 1.94.484-1.209 4.851-1.94-.484zm-1.694 4.731 2.91.726L11.4 20.61l-2.911-.726z"
    />
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m12.358 3.329 3.396.847-.665 2.668-3.396-.847z"
    />
  </Svg>
);

export default SvgMining;
