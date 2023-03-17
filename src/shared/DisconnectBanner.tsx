import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { TypographyPresets, Colors } from 'etta-ui';
import { useStoreState } from '../state/hooks';
import { useTranslation } from 'react-i18next';

const DisconnectBanner = () => {
  const isAppOnline = useStoreState((state) => state.internet.connected);

  const { t } = useTranslation();

  if (isAppOnline) {
    return null; // do nothing, all good.
  }

  if (!isAppOnline) {
    return <Text style={[styles.text, styles.textRed]}>{t('disconnected')}</Text>;
  }

  // App is connecting for first time, show grey banner
  return <Text style={[styles.text, styles.textGrey]}>Connecting...</Text>;
};

const styles = StyleSheet.create({
  text: {
    ...TypographyPresets.Body5,
    textAlign: 'center',
  },
  textGrey: {
    color: Colors.neutrals.light.neutral4,
  },
  textRed: {
    color: Colors.red.base,
  },
});

export default DisconnectBanner;
