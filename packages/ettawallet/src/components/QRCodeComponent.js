import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Share from 'react-native-share';
import PropTypes from 'prop-types';
import Colors from '../styles/colors';

const QRCodeComponent = ({
  value,
  isLogoRendered = true,
  logoSize = 60,
  size = 200,
  ecl = 'H',
  onError = () => {},
}) => {
  const qrCode = useRef();

  const handleShareQRCode = () => {
    qrCode.current.toDataURL(data => {
      const shareImageBase64 = {
        url: `data:image/png;base64,${data}`,
      };
      Share.open(shareImageBase64).catch(error => console.log(error));
    });
  };

  const renderQRCode = (
    <QRCode
      value={value}
      {...(isLogoRendered
        ? { logo: require('../images/bitcoin-circle.png') }
        : {})}
      size={size}
      logoSize={logoSize}
      color="#000000"
      logoBackgroundColor={Colors.onboardingBackground}
      backgroundColor="#FFFFFF"
      ecl={ecl}
      getRef={qrCode}
      onError={onError}
    />
  );

  return <View style={styles.qrCodeContainer}>{renderQRCode}</View>;
};

export default QRCodeComponent;

const styles = StyleSheet.create({
  qrCodeContainer: { borderWidth: 6, borderRadius: 8, borderColor: '#FFFFFF' },
});

QRCodeComponent.actionKeys = {
  Share: 'share',
  Copy: 'copy',
};

QRCodeComponent.actionIcons = {
  Share: {
    iconType: 'SYSTEM',
    iconValue: 'square.and.arrow.up',
  },
  Copy: {
    iconType: 'SYSTEM',
    iconValue: 'doc.on.doc',
  },
};

QRCodeComponent.propTypes = {
  value: PropTypes.string.isRequired,
  isMenuAvailable: PropTypes.bool,
  size: PropTypes.number,
  ecl: PropTypes.string,
  isLogoRendered: PropTypes.bool,
  onError: PropTypes.func,
  logoSize: PropTypes.number,
};
