import FingerprintScanner from 'react-native-fingerprint-scanner';
import { Platform, Alert } from 'react-native';
import PasscodeAuth from 'react-native-passcode-auth';
import * as NavigationService from '../navigation/NavigationService';
import { StackActions, CommonActions } from '@react-navigation/native';
import RNSecureKeyStore from 'react-native-secure-key-store';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { EttaStorageContext } from '../../storage/context';
import alert from '../components/Alert';

const Biometric = () => {
  const { getItem, setItem } = useContext(EttaStorageContext);
  const { t } = useTranslation();
  Biometric.STORAGEKEY = 'Biometrics';
  Biometric.FaceID = 'Face ID';
  Biometric.TouchID = 'Touch ID';
  Biometric.Biometrics = 'Biometrics';

  Biometric.isDeviceBiometricCapable = async () => {
    try {
      const isDeviceBiometricCapable =
        await FingerprintScanner.isSensorAvailable();
      if (isDeviceBiometricCapable) {
        return true;
      }
    } catch (e) {
      console.log('Biometrics isDeviceBiometricCapable failed');
      console.log(e);
      Biometric.setBiometricUseEnabled(false);
      return false;
    }
  };

  Biometric.biometricType = async () => {
    try {
      const isSensorAvailable = await FingerprintScanner.isSensorAvailable();
      return isSensorAvailable;
    } catch (e) {
      console.log('Biometrics biometricType failed');
      console.log(e);
    }
    return false;
  };

  Biometric.isBiometricUseEnabled = async () => {
    try {
      const enabledBiometrics = await getItem(Biometric.STORAGEKEY);
      return !!enabledBiometrics;
      // eslint-disable-next-line no-empty
    } catch (_) {}

    return false;
  };

  Biometric.isBiometricUseCapableAndEnabled = async () => {
    const isBiometricUseEnabled = await Biometric.isBiometricUseEnabled();
    const isDeviceBiometricCapable = await Biometric.isDeviceBiometricCapable();
    return isBiometricUseEnabled && isDeviceBiometricCapable;
  };

  Biometric.setBiometricUseEnabled = async value => {
    await setItem(Biometric.STORAGEKEY, value === true ? '1' : '');
  };

  Biometric.unlockWithBiometrics = async () => {
    const isDeviceBiometricCapable = await Biometric.isDeviceBiometricCapable();
    if (isDeviceBiometricCapable) {
      return new Promise(resolve => {
        FingerprintScanner.authenticate({
          description: t('biometrics.confirmIdentity'),
          fallbackEnabled: true,
        })
          .then(() => resolve(true))
          .catch(error => {
            console.log('Biometrics authentication failed');
            console.log(error);
            resolve(false);
          })
          .finally(() => FingerprintScanner.release());
      });
    }
    return false;
  };

  Biometric.clearKeychain = async () => {
    await RNSecureKeyStore.remove('data');
    await RNSecureKeyStore.remove('data_encrypted');
    await RNSecureKeyStore.remove(Biometric.STORAGEKEY);
    NavigationService.dispatch(StackActions.replace('WalletsRoot'));
  };

  Biometric.requestDevicePasscode = async () => {
    let isDevicePasscodeSupported = false;
    try {
      isDevicePasscodeSupported = await PasscodeAuth.isSupported();
      if (isDevicePasscodeSupported) {
        const isAuthenticated = await PasscodeAuth.authenticate();
        if (isAuthenticated) {
          Alert.alert(
            t('biometrics.encryptStorage'),
            t('biometrics.removeDecrypt'),
            [
              { text: t('cancel'), style: 'cancel' },
              {
                text: t('ok'),
                onPress: () => Biometric.clearKeychain(),
              },
            ],
            { cancelable: false }
          );
        }
      }
    } catch {
      isDevicePasscodeSupported = undefined;
    }
    if (isDevicePasscodeSupported === false) {
      alert(t('biometrics.noPasscode'));
    }
  };

  Biometric.showKeychainWipeAlert = () => {
    if (Platform.OS === 'ios') {
      Alert.alert(
        t('biometrics.encryptStorage'),
        t('biometrics.triedTenTimes'),
        [
          {
            text: t('cancel'),
            onPress: () => {
              NavigationService.dispatch(
                CommonActions.setParams({
                  index: 0,
                  routes: [
                    { name: 'UnlockWithScreenRoot' },
                    { params: { unlockOnComponentMount: false } },
                  ],
                })
              );
            },
            style: 'cancel',
          },
          {
            text: t('ok'),
            onPress: () => Biometric.requestDevicePasscode(),
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    }
  };
  return null;
};

export default Biometric;
