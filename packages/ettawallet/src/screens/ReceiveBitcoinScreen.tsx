import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { noHeader } from '../navigation/headers/Headers';
import DisconnectBanner from '../components/DisconnectBanner';
import variables from '../styles/variables';
import WalletHeader from '../navigation/headers/WalletHeader';

const ReceiveBitcoin = props => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <WalletHeader />
      <DisconnectBanner />
    </SafeAreaView>
  );
};

ReceiveBitcoin.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: variables.contentPadding,
  },
  nextBtn: {
    padding: variables.contentPadding,
  },
  button: {
    minWidth: 150,
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginBottom: 30,
  },
});

export default ReceiveBitcoin;
