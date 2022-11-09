import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { getNumberFormatSettings } from 'react-native-localize';
import { SafeAreaView } from 'react-native-safe-area-context';
import AmountKeyPad from '../components/Transact/AmountKeyPad';
import { noHeader } from '../navigation/headers/Headers';
import AmountValue from '../components/Transact/AmountValue';
import DisconnectBanner from '../components/DisconnectBanner';
import variables from '../styles/variables';
import { useBtcToLocalAmount, useLocalToBtcAmount } from '../utils/currency';
import WalletHeader from '../navigation/headers/WalletHeader';
import Button, { BtnSizes, BtnTypes } from '../components/Button';
import { navigate } from '../navigation/NavigationService';

const BTC_MAX_DECIMALS = 8;
const NUMBER_INPUT_MAX_DECIMALS = 2;
const MIN_BTC_AMOUNT = 0.001;

const convertToMaxSupportedPrecision = (amount: BigNumber) => {
  return new BigNumber(amount);
};

export const parseInputAmount = (
  inputString: string,
  decimalSeparator = '.'
): BigNumber => {
  if (decimalSeparator !== '.') {
    inputString = inputString.replace(decimalSeparator, '.');
  }
  return new BigNumber(inputString || '0');
};

export interface TransactionDataInput {
  inputAmount: BigNumber;
  amountIsInLocalCurrency: boolean;
  btc: BigNumber;
  comment?: string;
}

const { decimalSeparator } = getNumberFormatSettings();

export const useInputAmounts = (
  inputAmount: string,
  usingLocalAmount: boolean,
  inputBtcAmount?: BigNumber
) => {
  const parsedAmount = parseInputAmount(inputAmount, decimalSeparator);
  const localToBtc = useLocalToBtcAmount(parsedAmount);
  const btcToLocal = useBtcToLocalAmount(parsedAmount);

  const localAmountRaw = usingLocalAmount ? parsedAmount : btcToLocal;

  const btcAmountRaw = usingLocalAmount
    ? inputBtcAmount ?? localToBtc
    : parsedAmount;
  const localAmount =
    localAmountRaw && convertToMaxSupportedPrecision(localAmountRaw);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const btc = convertToMaxSupportedPrecision(btcAmountRaw!);

  return {
    localAmount,
    btc,
  };
};

function formatWithMaxDecimals(value: BigNumber | null, decimals: number) {
  if (!value || value.isNaN() || value.isZero()) {
    return '';
  }
  // The first toFormat limits the number of desired decimals and the second
  // removes trailing zeros.
  return parseInputAmount(
    value.toFormat(decimals, BigNumber.ROUND_DOWN),
    decimalSeparator
  ).toFormat();
}

const SendBitcoin = props => {
  const { t } = useTranslation();

  const [amount, setAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [usingLocalAmount, setUsingLocalAmount] = useState(true);
  const [nextButtonPressed, setNextButtonPressed] = useState(false);

  const showInputInLocalAmount = usingLocalAmount;

  const { btc, localAmount } = useInputAmounts(
    rawAmount,
    showInputInLocalAmount
  );

  const onPressMax = () => {
    // ideally, pressing max, should get the current balance of bitcoin in the wallet and
    // deduct it against the amount that would be payable in fees in the current market (use api service)
    // the balance should represent the total spendable amount (max) less any encumberances
    setAmount('1000');
    setRawAmount('1000'); // ideally this should get the max spendable bitcoin. Not fiat.
  };
  const onSwapInput = () => {
    onAmountChange('');
    setUsingLocalAmount(!usingLocalAmount);
  };

  useEffect(() => {
    onAmountChange('');
  }, []);

  const onSend = transactionData => {
    navigate('SendRoot', {
      transactionData: transactionData as TransactionDataInput,
    });
  };

  useEffect(() => {
    if (nextButtonPressed) {
      onSend();
      setNextButtonPressed(false);
    }
  }, [nextButtonPressed]);

  const onButtonPressed = () => setNextButtonPressed(true);

  const isAmountValid =
    localAmount?.isGreaterThanOrEqualTo(MIN_BTC_AMOUNT) ?? true;

  const onAmountChange = (updatedAmount: string) => {
    setAmount(updatedAmount);
    setRawAmount(updatedAmount);
  };

  const buttonLoading = nextButtonPressed;

  return (
    <SafeAreaView style={styles.container}>
      <WalletHeader />
      <DisconnectBanner />
      <View style={styles.contentContainer}>
        <AmountValue
          isOutgoingPaymentRequest={true}
          inputAmount={amount}
          btc={btc}
          usingLocalAmount={showInputInLocalAmount}
          onPressMax={onPressMax}
          onSwapInput={onSwapInput}
        />
        <AmountKeyPad
          amount={amount}
          maxDecimals={
            showInputInLocalAmount
              ? NUMBER_INPUT_MAX_DECIMALS
              : BTC_MAX_DECIMALS
          }
          onAmountChange={onAmountChange}
        />
      </View>
      <Button
        style={styles.nextBtn}
        size={BtnSizes.FULL}
        text={t('sendBitcoin.nextBtn')}
        showLoading={buttonLoading}
        type={BtnTypes.PRIMARY}
        onPress={onButtonPressed}
        disabled={!isAmountValid || buttonLoading}
      />
    </SafeAreaView>
  );
};

SendBitcoin.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: variables.contentPadding,
  },
  nextBtn: {
    padding: variables.contentPadding,
  },
  button: {
    minWidth: 150,
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginBottom: 30,
  },
});

export default SendBitcoin;
