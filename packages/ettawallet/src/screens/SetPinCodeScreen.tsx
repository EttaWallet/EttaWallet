/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pincode from '../components/Pincode/Pincode';
import colors from '../styles/colors';
import {
  HeaderTitleWithSubtitle,
  extraNavigationOptions,
} from '../navigation/headers/Headers';
import {
  navigate,
  navigateClearingStack,
  navigateHome,
} from '../navigation/NavigationService';
import { isPinValid } from '../utils/auth';
import { Screens } from '../navigation/Screens';

export const navOptions = ({ route }) => {
  const changePin = route.params?.changePin;
  let title = 'Create a PIN';
  if (changePin) {
    title = 'Change PIN';
  }
  return {
    ...extraNavigationOptions,
    headerTitle: () => <HeaderTitleWithSubtitle title={title} subTitle="" />,
  };
};

const SetPinCode = ({ navigation }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');

  const navigateToNextScreen = () => {
    navigateHome();
  };

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
      navigation.navigate('RecoveryPhraseSlides'); // ideally, user would set up biometrics first, but lets setup seed phrase first.
    } else {
      setIsVerifying(false);
      // reset all other PINs if no match
      setPin1('');
      setPin2('');
      setErrorText('The PINs did not match');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isVerifying ? (
        <Pincode
          title="Enter your PIN again to confirm"
          errorText={errorText}
          pin={pin2}
          onChangePin={onChangePin2}
          onCompletePin={onCompletePin2}
          onBoardingSetPin={false}
          verifyPin={true}
        />
      ) : (
        <Pincode
          title="Create a new PIN"
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
