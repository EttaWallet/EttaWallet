import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet } from 'react-native';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { Button, TypographyPresets } from 'etta-ui';
import KeyboardAwareScrollView from '../components/keyboard/KeyboardInScrollView';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import CancelButton from '../navigation/components/CancelButton';
import InputAnything, { InputStatus } from '../components/InputAnything';
import {
  formatLightningId,
  isValidLightningId,
  parseInputAddress,
} from '../utils/lightning/decode';
import { EIdentifierType } from '../utils/types';
import { showErrorBanner } from '../utils/alerts';
import { err } from '../utils/result';
import { navigate, navigateHome } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { sleep } from '../utils/helpers';
import { decodeLightningInvoice } from '../utils/lightning/helpers';
import { getLNURLParams } from '../utils/lnurl/decode';
import { LNURLPayParams } from 'js-lnurl';

// type RouteProps = NativeStackScreenProps<StackParamList, Screens.EnterAnythingScreen>;

const EnterAnythingScreen = ({ navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Enter anything" />,
      headerRight: () => <CancelButton onCancel={() => navigateHome()} />,
    });
  }, [navigation]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputString, setInputString] = useState('');

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
    setIsProcessing(true);
    // format input

    // decode input
    const parsedInput = await parseInputAddress(inputString);

    if (parsedInput?.data === EIdentifierType.LNURL && parsedInput.isLNURL) {
      await sleep(1000);
      const [username, domain] = inputString.split('@');
      const url = `https://${domain}/.well-known/lnurlp/${username.toLowerCase()}`;
      const paramsRes = await getLNURLParams(url);
      const errorMessage = `Either user ${username} doesn't exist at ${domain} or this lightning address is invalid`;
      if (paramsRes.isErr()) {
        showErrorBanner({
          message: errorMessage,
        });
        return err(errorMessage);
      }
      if (paramsRes.isOk()) {
        navigate(Screens.LNURLPayScreen, {
          data: paramsRes.value as LNURLPayParams,
        });
        console.log('paramsRes: ', paramsRes);
      }
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

      await sleep(2000); // wait 2 seconds

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scrollContainer]}
        keyboardShouldPersistTaps={'always'}
      >
        <InputAnything
          label={'Enter BOLT11 invoice or Lightning address'}
          status={inputStatus}
          inputValue={inputString}
          inputPlaceholder={''}
          multiline={true}
          autoFocus={true}
          onInputChange={setLightningIdentifier}
          shouldShowClipboard={shouldShowClipboard}
        />
      </KeyboardAwareScrollView>
      <Button
        style={styles.button}
        onPress={onPressContinue}
        title="Continue"
        disabled={isProcessing || !isValidLightningId(inputString)}
      />

      <KeyboardSpacer />
    </SafeAreaView>
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
    marginBottom: 16,
    marginHorizontal: 24,
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
