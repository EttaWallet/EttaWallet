import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { Screens } from '../navigation/Screens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import { InfoListItem } from '../components/InfoListItem';
import FormLabel from '../components/form/Label';
import { showErrorBanner, showSuccessBanner } from '../utils/alerts';
import { isLdkRunning, waitForLdk } from '../ldk';
import { addPeers, createLightningInvoice, startLightning } from '../utils/lightning/helpers';
import { err, ok } from '../utils/result';
import { createWithdrawCallbackUrl } from '../utils/lnurl/decode';
import { ELightningDataType } from '../utils/types';
import KeyboardAwareScrollView from '../components/keyboard/KeyboardInScrollView';
import { TextInput } from 'react-native-gesture-handler';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import BigNumber from 'bignumber.js';
import CancelButton from '../navigation/components/CancelButton';
import { navigateHome } from '../navigation/NavigationService';
import { useStoreState } from '../state/hooks';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.LNURLWithdrawScreen>;
type Props = RouteProps;

const LNURLWithdrawScreen = ({ route, navigation }: Props) => {
  const metadata = route.params?.data;
  const maxWithdrawable = metadata.maxWithdrawable / 1000;
  const minWithdrawable = metadata.minWithdrawable / 1000;
  const [inputAmount, setInputAmount] = useState(maxWithdrawable.toString());
  const amountToWithdraw = new BigNumber(inputAmount).toNumber();
  const [hasLimitError, setHasLimitError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inboundLiquidity = useStoreState((state) => state.lightning.maxReceivable);
  const [hasLiquidityError, setHasLiquidityError] = useState(false);

  const amountInputRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitleWithSubtitle title="LNURL-Withdraw" subTitle={`via ${metadata.domain}`} />
      ),
      headerRight: () => <CancelButton onCancel={() => navigateHome()} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const onChangeAmount = (amount: string) => {
    setInputAmount(amount);
  };

  useEffect(() => {
    if (amountToWithdraw > inboundLiquidity) {
      setHasLiquidityError(true);
    } else {
      setHasLiquidityError(false);
    }
    if (maxWithdrawable && maxWithdrawable < amountToWithdraw) {
      setHasLimitError(true);
    } else {
      setHasLimitError(false);
    }
  }, [amountToWithdraw, inboundLiquidity, maxWithdrawable]);

  const limitError = `Amount entered exceeds the max withdrawable limit for this LNURL request: ${maxWithdrawable.toLocaleString()} sats`;
  const liquidityError = `Amount entered exceeds your receiving capacity: ${inboundLiquidity.toLocaleString()} sats. You might incur a fee to receive this much.`;

  const onPressConfirm = async () => {
    try {
      setIsProcessing(true);
      // ensure Ldk is up
      const isLdkUp = await isLdkRunning();
      if (!isLdkUp) {
        await startLightning({});
      }
      await waitForLdk();

      // check that peers exist before we create invoice;
      addPeers().then();

      const invoice = await createLightningInvoice({
        expiryDeltaSeconds: 3600,
        amountSats: amountToWithdraw, // @todo: do we have enough inbound liquidity for amount? Show notice
        description: metadata.defaultDescription,
        selectedNetwork: 'bitcoin',
      });
      if (invoice.isErr()) {
        const message = 'Unable to create invoice for LNURL-Withdraw';
        showErrorBanner({
          title: 'LNURL-Withdraw Error',
          message: message,
        });
        return err(message);
      }
      const callbackRes = createWithdrawCallbackUrl({
        params: metadata,
        paymentRequest: invoice.value.to_str,
      });
      console.log('callbackRes: ', callbackRes);
      if (callbackRes.isErr()) {
        showErrorBanner({
          title: 'LNURL-Withdraw Error',
          message: callbackRes.error.message,
        });
        return err(callbackRes.error.message);
      }

      const channelStatusRes = await fetch(callbackRes.value);
      if (channelStatusRes.status !== 200) {
        showErrorBanner({
          title: 'LNURL-Withdraw Error',
          message: `Unable to withdraw from ${metadata.domain}`,
        });
        return err(`Unable to withdraw from ${metadata.domain}`);
      }

      const jsonRes = await channelStatusRes.json();
      if (jsonRes.status === 'ERROR') {
        showErrorBanner({
          title: 'LNURL-Withdraw Error',
          message: jsonRes.reason,
        });
        return err(jsonRes.reason);
      }
      showSuccessBanner({
        title: 'Withdrawn',
        message: 'LNURL-Withdraw request completed',
      });
      setIsProcessing(false);
      return ok({ type: ELightningDataType.lnurlWithdraw });
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
        <InfoListItem
          title="Min/max you can withdraw"
          value={`${minWithdrawable.toLocaleString()}/${maxWithdrawable.toLocaleString()}`}
          valueIsNumeric={true}
        />
        <View style={styles.descContainer}>
          <FormLabel>Description</FormLabel>
          <Text style={styles.desc} selectable={true}>
            {metadata?.defaultDescription}
          </Text>
        </View>
      </View>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'always'}
        contentContainerStyle={styles.contentContainer}
      >
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
          {hasLimitError ? (
            <FormLabel
              // @ts-ignore
              style={styles.amountError}
            >
              {limitError}
            </FormLabel>
          ) : null}
          {hasLiquidityError ? (
            <FormLabel
              // @ts-ignore
              style={styles.amountError}
            >
              {liquidityError}
            </FormLabel>
          ) : null}
        </View>
      </KeyboardAwareScrollView>
      {isProcessing && <ActivityIndicator color={Colors.orange.light} size="large" />}
      <Button
        title={amountToWithdraw ? `Withdraw ${amountToWithdraw.toLocaleString()} sats` : 'Withdraw'}
        onPress={onPressConfirm}
        style={styles.button}
        disabled={!amountToWithdraw || hasLimitError || hasLiquidityError || isProcessing}
      />
      <KeyboardSpacer />
    </SafeAreaView>
  );
};

LNURLWithdrawScreen.navigationOptions = () => ({
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
    paddingTop: 10,
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

export default LNURLWithdrawScreen;
