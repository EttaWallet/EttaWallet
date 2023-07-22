import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { Button, TypographyPresets } from 'etta-ui';
import KeyboardAwareScrollView from '../components/keyboard/KeyboardInScrollView';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import CancelButton from '../navigation/components/CancelButton';
import InputAnything, { InputStatus } from '../components/InputAnything';
import {
  decodeLightningInvoice,
  formatLightningId,
  isValidLightningId,
  parseInputAddress,
} from '../utils/lightning/decode';
import { EIdentifierType } from '../utils/types';
import { showErrorBanner } from '../utils/alerts';
import { err } from '../utils/result';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { sleep } from '../utils/helpers';

// type RouteProps = NativeStackScreenProps<StackParamList, Screens.EnterAnythingScreen>;

const EnterAnythingScreen = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Enter anything" />,
      headerRight: () => <CancelButton onCancel={() => 0} />,
    });
  }, [navigation]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputString, setInputString] = useState('');

  const onToggleKeyboard = (visible: boolean) => {
    setKeyboardVisible(visible);
  };

  const shouldShowClipboard = (clipboardContent: string): boolean => {
    return isValidLightningId(clipboardContent);
  };

  const setLightningIdentifier = (input: string) => {
    const formattedId = formatLightningId(input);

    setInputString(formattedId);
  };

  let inputStatus = InputStatus.Inputting;
  if (isProcessing) {
    inputStatus = InputStatus.Processing;
  }

  const onPressContinue = async () => {
    Keyboard.dismiss();
    setIsProcessing(true);
    // format input

    // decode input
    const parsedInput = await parseInputAddress(inputString);

    if (parsedInput?.data === EIdentifierType.LNURL && parsedInput.isLNURL) {
      // if LNURL, go to amount screen and then proceed to SendScreen
    } else if (parsedInput?.data === EIdentifierType.BOLT11_INVOICE && !parsedInput.isLNURL) {
      // if BOLT 11, get the decoded invoiceString and amount and proceed to SendScreen
      const decodedInvoice = await decodeLightningInvoice({
        paymentRequest: inputString,
      });
      if (decodedInvoice.isErr()) {
        showErrorBanner({
          message: "Can't decode this invoice",
          title: decodedInvoice.error.message,
          dismissAfter: 5000,
        });
        console.log('@decodedInvoice: ', decodedInvoice.error.message);
        return err(decodedInvoice.error.message);
      }

      const invoiceAmount = decodedInvoice.value.amount_satoshis;
      const invoiceString = decodedInvoice.value.to_str || inputString;

      await sleep(3000); // wait 3 seconds

      requestAnimationFrame(() => {
        navigate(Screens.SendScreen, {
          amount: invoiceAmount,
          paymentRequest: invoiceString,
        });
      });
    }
  };

  return (
    // show activity indicator and text about pending open
    <SafeAreaInsetsContext.Consumer>
      {(insets) => (
        <View style={styles.container}>
          <KeyboardAwareScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              !keyboardVisible && insets && { marginBottom: insets.bottom },
            ]}
            keyboardShouldPersistTaps={'always'}
          >
            <InputAnything
              label={'Enter BOLT11 invoice or Lightning address'}
              status={inputStatus}
              inputValue={inputString}
              inputPlaceholder={'e.g etta@8333.mobi'}
              multiline={true}
              onInputChange={setLightningIdentifier}
              shouldShowClipboard={shouldShowClipboard}
            />
            <Button
              style={styles.button}
              onPress={onPressContinue}
              title="Continue"
              disabled={isProcessing || !isValidLightningId(inputString)}
            />

            <KeyboardSpacer onToggle={onToggleKeyboard} />
          </KeyboardAwareScrollView>
        </View>
      )}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button: {
    justifyContent: 'center',
    marginVertical: 16,
  },
  title: {
    textAlign: 'center',
    ...TypographyPresets.Header3,
  },
  description: {
    paddingTop: 16,
    paddingBottom: 24,
    textAlign: 'center',
    ...TypographyPresets.Body5,
  },
});

EnterAnythingScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};
export default EnterAnythingScreen;
