/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pincode from '../components/Pincode/Pincode';
import colors from '../styles/colors';
import { useTranslation } from 'react-i18next';
import {
  HeaderTitleWithSubtitle,
  extraNavigationOptions,
} from '../navigation/headers/Headers';
import { EttaStorageContext } from '../../storage/context';
import { navigate } from '../navigation/NavigationService';
import { isPinValid } from '../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_PASSCODE_STORAGE_KEY } from '../../storage/consts';

/**
 * Saves User Passcode to storage
 *
 * @param pin {string} user entered & confirmed pin obtained from state`
 * @returns {Promise<void>}
 */
async function savePasscodeToDisk(pin) {
  await AsyncStorage.setItem(USER_PASSCODE_STORAGE_KEY, JSON.stringify(pin));
}

export const navOptions = ({ route }) => {
  const { t } = useTranslation();

  const changePin = route.params?.changePin;
  let title = t('pinCode.create');
  if (changePin) {
    title = t('pinCode.changePIN');
  }
  return {
    ...extraNavigationOptions,
    headerTitle: () => <HeaderTitleWithSubtitle title={title} subTitle="" />,
  };
};

const SetPinCode = () => {
  const { t } = useTranslation();
  const { setPhonePin } = useContext(EttaStorageContext);

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');

  const onChangePin1 = pin1 => {
    setPin1(pin1);
    setErrorText('');
  };

  const onChangePin2 = pin2 => {
    setPin2(pin2);
    setErrorText('');
  };

  const isPin1Valid = pin => {
    return isPinValid(pin);
  };

  const isPin2Valid = pin => {
    return pin1 === pin; // check whether true that pin1 equals pin2
  };

  const onCompletePin1 = () => {
    if (isPin1Valid(pin1)) {
      setIsVerifying(true);
    }
  };

  const onCompletePin2 = async pin2 => {
    if (isPin1Valid(pin1) && isPin2Valid(pin2)) {
      setPhonePin(pin2); // update context
      savePasscodeToDisk(pin2); // save to phone storage
      navigate('TabsRoot');
    } else {
      setIsVerifying(false);
      // reset all other PINs if no match
      setPin1('');
      setPin2('');
      setErrorText(t('pinCode.pinsDontMatch'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isVerifying ? (
        <Pincode
          title={t('pinCode.verify')}
          errorText={errorText}
          pin={pin2}
          onChangePin={onChangePin2}
          onCompletePin={onCompletePin2}
          onBoardingSetPin={false}
          verifyPin={true}
        />
      ) : (
        <Pincode
          title={t('pinCode.createNew')}
          errorText={errorText}
          pin={pin1}
          onChangePin={onChangePin1}
          onCompletePin={onCompletePin1}
          onBoardingSetPin={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.onboardingBackground,
    justifyContent: 'space-between',
  },
  changePinContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
});

export default SetPinCode;

SetPinCode.navigationOptions = navOptions;
