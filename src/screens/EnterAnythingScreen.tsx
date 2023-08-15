import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet } from 'react-native';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { Button, TypographyPresets } from 'etta-ui';
import KeyboardAwareScrollView from '../components/keyboard/KeyboardInScrollView';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import CancelButton from '../navigation/components/CancelButton';
import InputAnything, { InputStatus } from '../components/InputAnything';
import { formatLightningId, isValidLightningId, processInputData } from '../utils/lightning/decode';
import { showErrorBanner } from '../utils/alerts';
import { navigateHome } from '../navigation/NavigationService';

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

    const result = await processInputData({
      data: inputString,
      showErrors: true,
    });

    if (result.isOk()) {
      setIsProcessing(false);
    }

    if (result.isErr()) {
      showErrorBanner({
        title: 'Invalid input',
        message: "Can't process this identifier. Verify that it's valid",
      });
      setIsProcessing(false);
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
