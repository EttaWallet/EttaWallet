import * as React from 'react';
import Svg, { SvgProps, Path, Circle } from 'react-native-svg';

const SvgNode2Connections = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M12.54 7.165c.5-.162.901-.543 1.091-1.03l4.233 4.234a1.76 1.76 0 0 0-1.03 1.092L12.54 7.165zm4.295 5.375-4.296 4.295c.5.162.902.543 1.092 1.03l4.233-4.234a1.755 1.755 0 0 1-1.03-1.092zm-5.375 4.295-4.295-4.296c-.162.5-.542.902-1.03 1.092l4.234 4.233c.19-.487.591-.867 1.092-1.03zm0-9.67-4.295 4.296a1.755 1.755 0 0 0-1.03-1.092l4.234-4.233c.19.487.591.867 1.092 1.03z" />
    <Path
      fillRule="evenodd"
      d="M12 4.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2.5 1a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"
      clipRule="evenodd"
    />
    <Circle cx={12} cy={18.5} r={2.5} />
    <Circle cx={5.5} cy={12} r={2.5} />
    <Path
      fillRule="evenodd"
      d="M18.5 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM16 12a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z"
      clipRule="evenodd"
    />
  </Svg>
);

export default SvgNode2Connections;
