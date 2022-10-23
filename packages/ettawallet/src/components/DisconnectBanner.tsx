import React, { useState, useContext } from 'react';
import { EttaStorageContext } from '../../storage/context';
import { Text } from '@ettawallet/react-native-kit';
import { StyleSheet } from 'react-native';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

const DisconnectBanner = () => {
  const { connected } = useContext(EttaStorageContext);
  const [appConnected, setAppConnected] = useState(connected);

  if (appConnected) {
    return null; // do nothing, all good.
  }

  if (!appConnected) {
    return (
      <Text style={[styles.text, styles.textRed]}>
        <Text style={fontStyles.regular600}>Bad connection</Text> Some features
        disabled
      </Text>
    );
  }

  // App is connecting for first time, show grey banner
  return (
    <Text style={[styles.text, styles.textGrey, fontStyles.regular600]}>
      Connecting
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    ...fontStyles.small,
    textAlign: 'center',
    // Unset explicit lineHeight set by fonts.tsx otherwise the text is not centered vertically
    lineHeight: undefined,
  },
  textGrey: {
    color: colors.gray4,
  },
  textRed: {
    color: colors.warning,
  },
});

export default DisconnectBanner;
