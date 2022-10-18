import * as React from 'react';
import Svg, { SvgProps, Path, Rect } from 'react-native-svg';

const SvgMilk = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <Path d="M14.054 5.985a.944.944 0 0 0-.836-.485h-2.402a.96.96 0 0 0-.865.526c-.566 1.134-1.83 3.877-1.943 5.97a.004.004 0 0 1-.004.004.004.004 0 0 0-.004.004V18.5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6.497a.003.003 0 0 0-.003-.003.003.003 0 0 1-.003-.003c-.1-2.39-1.368-4.965-1.94-6.012z" />
    <Rect width={6} height={2} x={9} y={3.5} rx={0.5} />
    <Path strokeLinecap="round" d="M10 12.5V18" />
  </Svg>
);

export default SvgMilk;
