import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@ettawallet/react-native-kit';
import Button, { BtnSizes, BtnTypes } from '../components/Button';
import { View, StyleSheet } from 'react-native';
import { navigate } from '../navigation/NavigationService';
import FaceID from '../icons/FaceID';
import * as Keychain from 'react-native-keychain';
import { Spacing } from '../styles/styles';
import Logger from '../utils/logger';
import { EttaStorageContext } from '../../storage/context';

const ProtectWallet = () => {
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const { setSupportedBiometrics, supportedBiometrics, phonePin } =
    useContext(EttaStorageContext);
  const { t } = useTranslation();

  const getSupportedBiometryType = async () => {
    const biometrics = await Keychain.getSupportedBiometryType();

    if (biometrics !== null) {
      setHasBiometrics(true);
      setSupportedBiometrics(biometrics);
      console.log('Biometrics: ', biometrics);
    }
  };

  getSupportedBiometryType();
  Logger.debug('Security', 'Active Biometrics: ' + supportedBiometrics);

  const onPressBiometrics = () => {
    // setup faceID or touch ID?
  };

  const onPressPassCode = () => {
    // go to setPin
    navigate('SetPin');
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <FaceID />
      </View>
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h3"
        fontWeight="bold"
        fontColor="dark"
      >
        {t('protectWallet.title')}
      </Text>
      <Text style={styles.text}>{t('protectWallet.subtitle')}</Text>
      {hasBiometrics && supportedBiometrics !== null && (
        <Button
          onPress={onPressBiometrics}
          text={t('protectWallet.useBiometricsBtn', {
            biometryType: t(
              `protectWallet.biometryType.${supportedBiometrics}`
            ),
          })}
          size={BtnSizes.MEDIUM}
          type={BtnTypes.ONBOARDING}
          testID="EnableBiometryButton"
        />
      )}
      {!phonePin && (
        <Button
          text={t('protectWallet.createPinBtn')}
          size={BtnSizes.FULL}
          type={BtnTypes.ONBOARDING_SECONDARY}
          onPress={() => navigate('SetPin')}
          style={{ marginBottom: 10 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'space-between',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
  button: {
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: Spacing.Thick24,
    alignSelf: 'center',
  },
});

export default ProtectWallet;
