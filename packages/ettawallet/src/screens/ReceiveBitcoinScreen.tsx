import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Text, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerWithBackButton } from '../navigation/headers/Headers';
import DisconnectBanner from '../components/DisconnectBanner';
import variables from '../styles/variables';
import QRCodeComponent from '../components/QRCodeComponent';
import colors from '../styles/colors';
import {
  Copy,
  Share as ShareIcon,
} from '@ettawallet/rn-bitcoin-icons/dist/filled';
import BdkRn from 'bdk-rn';
import Clipboard from '@react-native-community/clipboard';
import Logger from '../utils/logger';
import Button, { BtnSizes, BtnTypes } from '../components/Button';
import Share from 'react-native-share';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import fontStyles from '../styles/fonts';
import HorizontalLine from '../components/HorizontalLine';

const ReceiveBitcoin = () => {
  const { t } = useTranslation();
  const [btcAddress, setBtcAddress] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [shareableUri, setShareableUri] = useState('');

  const generateURI = () => {
    let uri;
    if (btcAddress && !inputAmount && !inputDescription) {
      uri = 'bitcoin:' + btcAddress;
    } else if (btcAddress && inputAmount && !inputDescription) {
      uri = 'bitcoin:' + btcAddress + '?amount=' + inputAmount;
    } else if (btcAddress && inputAmount && inputDescription) {
      uri =
        'bitcoin:' +
        btcAddress +
        '?amount=' +
        inputAmount +
        '&label=' +
        inputDescription;
    }
    setShareableUri(uri);
    return uri;
  };

  const getOnchainReceiveAddress = async () => {
    try {
      const { data } = await BdkRn.getNewAddress();
      setBtcAddress(data);
      console.log('testnet address: ', data);
    } catch (e) {
      console.log(e);
    }
  };

  // @TODO: regenerate address if address already has a balance or unconfirmed transaction in queue

  const onPressCopy = () => {
    // @TODO: should be bitcoin URI
    Clipboard.setString(shareableUri);
    Logger.showMessage(t('receiveBitcoin.addressCopied'));
  };

  const onPressShare = () => {
    // @TODO: should be bitcoin URI
    Share.open({ message: shareableUri }).catch(error => console.log(error));
  };

  const onAddAmount = (amount: string) => {
    setInputAmount(amount);
  };

  const onAddDescription = (description: string) => {
    setInputDescription(description);
  };

  useEffect(() => {
    getOnchainReceiveAddress();
    generateURI();
  }, []);

  useEffect(() => {
    generateURI();
  }, [inputAmount, inputDescription]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DisconnectBanner />
      <View style={styles.qrcontainer}>
        <QRCodeComponent value={btcAddress} />
        <Text style={styles.address}>{btcAddress}</Text>
      </View>
      <View style={styles.btnContainer}>
        <Button
          icon={<ShareIcon color={colors.dark} height={24} width={24} />}
          iconPositionLeft={true}
          text={t('receiveBitcoin.shareBtn')}
          size={BtnSizes.SMALL}
          type={BtnTypes.MONOCHROME}
          onPress={onPressShare}
          style={styles.button}
        />
        <Button
          icon={<Copy color={colors.dark} height={24} width={24} />}
          iconPositionLeft={true}
          text={t('receiveBitcoin.copyBtn')}
          size={BtnSizes.SMALL}
          type={BtnTypes.MONOCHROME}
          onPress={onPressCopy}
          style={styles.button}
        />
      </View>
      <KeyboardAwareScrollView keyboardShouldPersistTaps={'always'}>
        <View style={styles.amountInputContainer}>
          <Text style={styles.modifyTitle}>
            {t('receiveBitcoin.modifyTitle')}
          </Text>
          <HorizontalLine />
          <TextInput
            multiline={false}
            autoFocus={false}
            keyboardType={'decimal-pad'}
            onChangeText={onAddAmount}
            value={inputAmount.length > 0 ? `${inputAmount}` : undefined}
            placeholderTextColor={colors.gray3}
            placeholder={t('receiveBitcoin.specifyAmount')}
            style={[styles.amountInput, styles.amountColor]}
          />
          <HorizontalLine />
          <TextInput
            multiline={true}
            autoFocus={false}
            keyboardType={'default'}
            onChangeText={onAddDescription}
            value={
              inputDescription.length > 0 ? `${inputDescription}` : undefined
            }
            placeholderTextColor={colors.gray3}
            placeholder={t('receiveBitcoin.addDescription')}
            style={[styles.descriptionInput, styles.descriptionColor]}
          />
          <HorizontalLine />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

ReceiveBitcoin.navigationOptions = () => ({
  ...headerWithBackButton,
  gestureEnabled: false,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: variables.contentPadding,
    backgroundColor: 'white',
  },
  qrcontainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 30,
  },
  address: {
    paddingTop: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 5,
  },
  amountInputContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  modifyTitle: {
    ...fontStyles.regular600,
    color: colors.onboardingBlue,
  },
  amountInput: {
    ...fontStyles.regular,
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    lineHeight: Platform.select({ android: 24, ios: 20 }), // vertical align = center
    minHeight: 20, // setting height manually b.c. of bug causing text to jump on Android
  },
  amountColor: {
    color: colors.orangeUI,
  },
  descriptionInput: {
    ...fontStyles.regular,
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    lineHeight: Platform.select({ android: 24, ios: 20 }), // vertical align = center
    minHeight: 20, // setting height manually b.c. of bug causing text to jump on Android
  },
  descriptionColor: {
    color: colors.dark,
  },
});

export default ReceiveBitcoin;
