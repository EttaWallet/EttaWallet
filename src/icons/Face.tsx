import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';
import { Colors } from 'etta-ui';

export const Face = (props: SvgProps) => {
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 90.448C72.339 90.448 90.448 72.339 90.448 50C90.448 27.661 72.339 9.552 50 9.552C27.661 9.552 9.552 27.661 9.552 50C9.552 72.339 27.661 90.448 50 90.448ZM50 93.75C74.162 93.75 93.75 74.162 93.75 50C93.75 25.838 74.162 6.25 50 6.25C25.838 6.25 6.25 25.838 6.25 50C6.25 74.162 25.838 93.75 50 93.75Z"
        fill={Colors.orange.base}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M57.425 73.174C57.848 74.083 57.453 75.163 56.543 75.586C52.339 77.538 48.174 77.896 44.761 76.33C41.3 74.741 39.043 71.372 38.302 66.8L41.887 66.219C42.486 69.912 44.178 72.066 46.277 73.029C48.424 74.015 51.431 73.955 55.013 72.292C55.923 71.869 57.003 72.264 57.425 73.174Z"
        fill={Colors.orange.base}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M52.476 54.953V47.524H55.778V58.255H46.698V54.953H52.476Z"
        fill={Colors.orange.base}
      />
      <Path
        d="M73.113 39.269C73.113 41.093 71.635 42.571 69.811 42.571C67.988 42.571 66.509 41.093 66.509 39.269C66.509 37.445 67.988 35.967 69.811 35.967C71.635 35.967 73.113 37.445 73.113 39.269Z"
        fill={Colors.orange.base}
      />
      <Path
        d="M33.491 39.269C33.491 41.093 32.012 42.571 30.189 42.571C28.365 42.571 26.887 41.093 26.887 39.269C26.887 37.445 28.365 35.967 30.189 35.967C32.012 35.967 33.491 37.445 33.491 39.269Z"
        fill={Colors.orange.base}
      />
    </Svg>
  );
};

export default React.memo(Face);
