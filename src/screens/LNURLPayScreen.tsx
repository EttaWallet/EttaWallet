import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
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
import { getTotalBalance } from '../utils/lightning/helpers';
import BigNumber from 'bignumber.js';
import { showErrorBanner } from '../utils/alerts';
import { navigate, navigateHome } from '../navigation/NavigationService';
import CancelButton from '../navigation/components/CancelButton';
import { lnurlPay } from '../utils/lnurl';
import { err } from '../utils/result';
import JSONArrayRenderer from '../components/JSONArrayRenderer';
import { InfoListItem } from '../components/InfoListItem';

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
  const [userComment, setUserComment] = useState('');

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
        comment: userComment,
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

  const onBlur = () => {
    const trimmedComment = userComment?.trim();
    setUserComment(trimmedComment);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={styles.contentContainer}
      >
        {metadata?.metadata && (
          <View style={styles.metaContainer}>
            <JSONArrayRenderer decodedMetadata={metadata.decodedMetadata} />
            <View style={styles.metaContainer}>
              <InfoListItem
                title="Min/max you can send"
                value={`${minSendable.toLocaleString()}/${maxSendable.toLocaleString()}`}
                valueIsNumeric={true}
              />
            </View>
          </View>
        )}
        <View style={styles.amountInputContainer}>
          <FormLabel
            // @ts-ignore
            style={[styles.label, inputAmount === '' ? styles.labelError : styles.labelSuccess]}
            onPress={() => {
              //@ts-ignore
              amountInputRef.current?.focus();
            }}
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
        {metadata.commentAllowed > 0 && (
          <TextInput
            style={styles.inputContainer}
            autoFocus={false}
            multiline={true}
            numberOfLines={3}
            maxLength={metadata.commentAllowed}
            onChangeText={setUserComment}
            value={userComment}
            placeholder={`Add a comment (max ${metadata.commentAllowed} chars)`}
            placeholderTextColor={Colors.neutrals.light.neutral6}
            returnKeyType={'done'}
            onBlur={onBlur}
            blurOnSubmit={true}
          />
        )}
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
    marginBottom: 5,
  },
  metaContainer: {
    marginTop: 5,
  },
  amountInput: {
    marginLeft: 16,
    flex: 1,
    textAlign: 'right',
    ...TypographyPresets.Body2,
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
    color: Colors.common.black,
    ...TypographyPresets.Body4,
    paddingLeft: 3,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
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
  inputContainer: {
    height: 60,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
    paddingTop: 8,
  },
});

export default LNURLPayScreen;
