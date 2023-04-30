import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
  ActivityIndicator,
  Dimensions,
  Text,
} from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { createLightningInvoice, startLightning } from '../utils/lightning/helpers';
import QRCode from 'react-native-qrcode-svg';
import { Colors, TypographyPresets } from 'etta-ui';
import { moderateScale } from '../utils/sizing';

const ReceiveDetailsScreen = () => {
  const [invoice, setInvoice] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  return <SafeAreaView style={styles.container}></SafeAreaView>;
};

ReceiveDetailsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...TypographyPresets.Header3,
  },
  text: {
    color: Colors.neutrals.light.neutral6,
    marginHorizontal: moderateScale(16),
    textAlign: 'center',
  },
});

export default ReceiveDetailsScreen;
