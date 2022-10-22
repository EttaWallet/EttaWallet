/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pincode from '../components/Pincode/Pincode';
import colors from '../styles/colors';

const PIN_BLOCKLIST = [
  '000000',
  '111111',
  '222222',
  '333333',
  '444444',
  '555555',
  '666666',
  '777777',
  '888888',
  '999999',
  '123456',
  '654321',
];

export const isPinValid = pin => {
  return /^\d{6}$/.test(pin) && !PIN_BLOCKLIST.includes(pin);
};
const SetPinCode = ({ navigation }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');

  const isChangingPin = () => {
    return true;
  };

  const onChangePin1 = pin1 => {
    setPin1(pin1);
  };

  const onChangePin2 = pin2 => {
    setPin2(pin2);
  };

  const isPin1Valid = pin => {
    return isPinValid(pin);
  };

  const isPin2Valid = pin => {
    return pin1 === pin;
  };

  const onCompletePin1 = () => {
    if (isPin1Valid(pin1)) {
      setIsVerifying(true);
      setPin1('');
      setPin2('');
      setErrorText('Please use a stronger PIN');
    }
  };

  const onCompletePin2 = async pin2 => {
    // const { pin1 } = this.state;
    if (isPin1Valid(pin1) && isPin2Valid(pin2)) {
      this.navigateToNextScreen();
    } else {
      setIsVerifying(false);
      setPin1('');
      setPin2('');
      setErrorText('The PINs did not match, lol. Try again');
    }
  };

  const changingPin = isChangingPin();

  //   const errorText = "The PINs didn't match, lol. Try again";
  return (
    <SafeAreaView style={styles.container}>
      {isVerifying ? (
        <Pincode
          title="Create a new PIN"
          errorText={errorText}
          pin={pin2}
          onChangePin={onChangePin2}
          onCompletePin={onCompletePin2}
          onBoardingSetPin={!changingPin}
          verifyPin={true}
        />
      ) : (
        <Pincode
          title=""
          errorText={errorText}
          pin={pin1}
          onChangePin={onChangePin1}
          onCompletePin={onCompletePin1}
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
