import { IconTextButton, Text } from '@ettawallet/react-native-kit';
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const QRCodeComponent = ({
  value,
  isLogoRendered = true,
  logoSize = 50,
  size = 220,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onError = () => {},
}) => {
  const qrCode = useRef();

  const renderQRCode = (
    <QRCode
      value={value}
      {...(isLogoRendered
        ? { logo: require('../images/bitcoin-circle.png') }
        : {})}
      size={size}
      logoSize={logoSize}
      color="#000000"
      logoBackgroundColor="#FFFFFF"
      backgroundColor="#FFFFFF"
      getRef={qrCode}
      onError={onError}
    />
  );

  return (
    <>
      <View style={styles.qrCodeContainer}>{renderQRCode}</View>
      <Text style={styles.text} typography="base">
        View address
      </Text>
      <View style={styles.btnGroup}>
        <IconTextButton
          variant="outlined"
          color="secondary"
          tone="neutral4"
          size="small"
          iconProps={{
            name: 'icon-share',
            fontColor: 'dark',
            size: 'deca',
          }}
          label={'Share'}
        />
        <IconTextButton
          variant="outlined"
          color="secondary"
          tone="neutral4"
          size="small"
          iconProps={{
            name: 'icon-copy',
            fontColor: 'dark',
            size: 'deca',
          }}
          label={'Copy'}
        />
        <IconTextButton
          variant="outlined"
          color="secondary"
          tone="neutral4"
          size="small"
          iconProps={{
            name: 'icon-ellipsis',
            fontColor: 'dark',
            size: 'deca',
          }}
        />
      </View>
    </>
  );
};

export default QRCodeComponent;

const styles = StyleSheet.create({
  qrCodeContainer: {
    borderWidth: 6,
    borderRadius: 8,
    borderColor: '#FFFFFF',
    alignSelf: 'center',
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
  },
  text: {
    textAlign: 'center',
    paddingTop: 10,
  },
});
