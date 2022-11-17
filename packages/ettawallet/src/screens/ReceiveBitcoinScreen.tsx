import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { noHeader } from '../navigation/headers/Headers';
import DisconnectBanner from '../components/DisconnectBanner';
import variables from '../styles/variables';
import QRCodeComponent from '../components/QRCodeComponent';
import colors from '../styles/colors';
import { CallToActionBox } from '../components/CallToActionBox';
import { Copy } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import BdkRn from 'bdk-rn';
import Clipboard from '@react-native-community/clipboard';
import Logger from '../utils/logger';
import Button, { BtnSizes, BtnTypes } from '../components/Button';
import Share from 'react-native-share';

const ReceiveBitcoin = () => {
  const { t } = useTranslation();
  const [btcAddress, setBtcAddress] = useState('');

  const getOnchainReceiveAddress = async () => {
    try {
      const { data } = await BdkRn.getNewAddress();
      setBtcAddress(data);
    } catch (e) {
      console.log(e);
    }
  };

  const onPressCopy = () => {
    Clipboard.setString(btcAddress);
    Logger.showMessage(t('receiveBitcoin.addressCTA.addressCopied'));
  };

  const onPressShare = () => {
    Share.open({ message: btcAddress }).catch(error => console.log(error));
  };

  useEffect(() => {
    getOnchainReceiveAddress();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <DisconnectBanner />
      <View style={styles.qrcontainer}>
        <QRCodeComponent value={btcAddress} />
      </View>
      <CallToActionBox
        icon={<Copy height={39} width={39} color={colors.goldUI} />}
        header={t('receiveBitcoin.addressCTA.header')}
        body={btcAddress}
        cta={t('receiveBitcoin.addressCTA.copyBtn')}
        onPressCta={onPressCopy}
      />
      <Button
        text={t('receiveBitcoin.shareBtn')}
        size={BtnSizes.FULL}
        type={BtnTypes.PRIMARY}
        onPress={onPressShare}
        style={{ paddingTop: 40 }}
      />
    </SafeAreaView>
  );
};

ReceiveBitcoin.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: variables.contentPadding,
    backgroundColor: 'white',
  },
  qrcontainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 40,
    backgroundColor: colors.gray1,
  },
});

export default ReceiveBitcoin;
