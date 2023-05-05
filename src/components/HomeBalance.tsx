import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { Icon, TypographyPresets } from 'etta-ui';
import { getLightningStore } from '../utils/lightning/helpers';

export const HomeBalance = ({ style = styles.balance }: { style?: StyleProp<TextStyle> }) => {
  const balance = getLightningStore().claimableBalance;

  const fiatValue: number = 0;

  return (
    <View style={styles.container}>
      <Icon name="icon-bitcoin-2" style={styles.btcIcon} />
      <Text style={style}>{balance}</Text>
      {/* Show fiat value if enabled in settings */}
      <Text style={styles.fiatValue}>UGX {fiatValue}</Text>
    </View>
  );
};

const fontFamilyChoice = Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    ...TypographyPresets.Header1,
    fontFamily: fontFamilyChoice,
  },
  btcIcon: {
    fontSize: 52,
    color: '#ff9d00',
  },
  fiatValue: {
    ...TypographyPresets.Body3,
    fontFamily: fontFamilyChoice,
    marginVertical: 5,
  },
});
