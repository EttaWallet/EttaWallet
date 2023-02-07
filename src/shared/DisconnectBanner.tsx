import React from 'react';
import { useEttaStorageContext } from '../storage/context';
import { StyleSheet, Text } from 'react-native';
import { TypographyPresets, Colors } from 'etta-ui';

const DisconnectBanner = () => {
  const { connected } = useEttaStorageContext();

  if (connected) {
    return null; // do nothing, all good.
  }

  if (!connected) {
    return (
      <Text style={[styles.text, styles.textRed]}>
        <Text style={{ ...TypographyPresets.Body4 }}>Bad connection</Text> Some
        features disabled
      </Text>
    );
  }

  // App is connecting for first time, show grey banner
  return <Text style={[styles.text, styles.textGrey]}>Connecting</Text>;
};

const styles = StyleSheet.create({
  text: {
    ...TypographyPresets.Body4,
    textAlign: 'center',
    // Unset explicit lineHeight set by fonts.tsx otherwise the text is not centered vertically
    lineHeight: undefined,
  },
  textGrey: {
    color: Colors.neutrals.light.neutral4,
  },
  textRed: {
    color: Colors.red.base,
  },
});

export default DisconnectBanner;
