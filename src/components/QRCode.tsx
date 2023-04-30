import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import SVG from 'react-native-svg';

function QRCodeGen({
  value,
  size = 100,
  svgRef,
}: {
  value: string;
  size: number;
  svgRef: React.MutableRefObject<SVG>;
}) {
  return <QRCode value={value} size={size} getRef={(ref) => (svgRef.current = ref)} />;
}

export default React.memo(QRCodeGen);
