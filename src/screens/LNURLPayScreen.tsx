import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { Screens } from '../navigation/Screens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import KeyboardAwareScrollView from '../components/keyboard/KeyboardInScrollView';
import { TextInput } from 'react-native-gesture-handler';
import FormLabel from '../components/form/Label';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import { InfoListItem } from '../components/InfoListItem';
import { getTotalBalance } from '../utils/lightning/helpers';
import BigNumber from 'bignumber.js';
import { showErrorBanner } from '../utils/alerts';
import { navigate, navigateHome } from '../navigation/NavigationService';
import CancelButton from '../navigation/components/CancelButton';
import { lnurlPay } from '../utils/lnurl';
import { err } from '../utils/result';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.LNURLPayScreen>;
type Props = RouteProps;

const LNURLPayScreen = ({ route, navigation }: Props) => {
  const metadata = route.params?.data;
  const maxSendable = metadata.maxSendable / 1000;
  const minSendable = metadata.minSendable / 1000;
  const { spendableBalance } = getTotalBalance({});
  const [inputAmount, setInputAmount] = useState(minSendable.toString());
  const amountPayable = new BigNumber(inputAmount).toNumber();
  const [hasBalanceError, setHasBalanceError] = useState(false);
  const [hasLimitError, setHasLimitError] = useState(false);

  const amountInputRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitleWithSubtitle title="LNURL-Pay Request" subTitle={`via ${metadata.domain}`} />
      ),
      headerRight: () => <CancelButton onCancel={() => navigateHome()} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const onChangeAmount = (amount: string) => {
    setInputAmount(amount);
  };

  useEffect(() => {
    if (amountPayable > spendableBalance) {
      setHasBalanceError(true);
    } else {
      setHasBalanceError(false);
    }
    if (maxSendable && maxSendable < amountPayable) {
      setHasLimitError(true);
    } else {
      setHasLimitError(false);
    }
  }, [amountPayable, maxSendable, spendableBalance]);

  const balanceError = `Amount entered exceeds your wallet balance: ${spendableBalance.toLocaleString()} sats`;
  const limitError = `Amount entered exceeds the max sendable limit for this LNURL request: ${maxSendable.toLocaleString()} sats`;

  const onPressConfirm = async () => {
    try {
      const milliSats = Math.floor(amountPayable * 1000);

      const callbackRes = await lnurlPay({
        params: metadata,
        milliSats,
        comment: 'Paid with EttaWallet',
      });

      if (callbackRes.isErr()) {
        showErrorBanner({
          title: 'LNURL-Pay Error',
          message: callbackRes.error.message,
        });
        return err(callbackRes.error.message);
      }

      if (callbackRes.isOk()) {
        navigate(Screens.SendScreen, {
          amount: inputAmount,
          paymentRequest: callbackRes.value.pr,
        });
      }
    } catch (e) {
      showErrorBanner({
        title: 'LNURL Error',
        message: e.message,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.metaContainer}>
        {metadata.metadata && (
          <>
            <InfoListItem
              title="Min/max you can send"
              value={`${minSendable.toLocaleString()}/${maxSendable.toLocaleString()}`}
              valueIsNumeric={true}
            />
            {metadata?.metadata[0][1] && (
              <InfoListItem
                title="Receipient"
                value={JSON.parse(metadata?.metadata)[0][1]}
                canCopy={true}
              />
            )}
            {metadata?.metadata[1][1] && (
              <View style={styles.descContainer}>
                <FormLabel>Description</FormLabel>
                <Text style={styles.desc} selectable={true}>
                  {JSON.parse(metadata?.metadata)[1][1]}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.amountInputContainer}>
          <FormLabel
            // @ts-ignore
            style={[styles.label, inputAmount === '' ? styles.labelError : styles.labelSuccess]}
          >
            Enter amount in sats
          </FormLabel>
          <TextInput
            multiline={false}
            autoFocus={true}
            keyboardType={'decimal-pad'}
            onChangeText={onChangeAmount}
            value={inputAmount.length > 0 ? `${inputAmount}` : undefined}
            style={styles.amountInput}
            ref={amountInputRef}
          />
        </View>
        <View>
          {hasBalanceError ? (
            <FormLabel
              // @ts-ignore
              style={styles.amountError}
            >
              {balanceError}
            </FormLabel>
          ) : null}
          {hasLimitError ? (
            <FormLabel
              // @ts-ignore
              style={styles.amountError}
            >
              {limitError}
            </FormLabel>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
      <Button
        title={amountPayable ? `Send ${amountPayable.toLocaleString()} sats` : 'Send'}
        onPress={onPressConfirm}
        style={styles.button}
        disabled={!amountPayable || hasBalanceError || hasLimitError}
      />
      <KeyboardSpacer />
    </SafeAreaView>
  );
};

LNURLPayScreen.navigationOptions = () => ({
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaContainer: {
    marginVertical: 10,
    marginHorizontal: 16,
  },
  amountInput: {
    paddingTop: Platform.OS === 'android' ? 22 : 3,
    marginLeft: 10,
    flex: 1,
    textAlign: 'right',
    ...TypographyPresets.Body3,
  },
  fiatCurrencyColor: {
    color: Colors.green.base,
  },
  button: {
    justifyContent: 'center',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  label: {
    paddingTop: 9,
    color: Colors.common.black,
    ...TypographyPresets.Body4,
    paddingLeft: 3,
  },
  labelSuccess: {
    color: Colors.green.light,
  },
  labelError: {
    color: Colors.red.light,
  },
  amountError: {
    ...TypographyPresets.Body5,
    color: Colors.red.base,
    paddingLeft: 3,
  },
  descContainer: {
    borderRadius: 4,
    backgroundColor: Colors.neutrals.light.neutral1,
    padding: 16,
    marginTop: 5,
  },
  desc: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
    paddingTop: 10,
  },
});

export default LNURLPayScreen;
