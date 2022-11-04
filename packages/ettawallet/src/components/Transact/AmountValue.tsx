/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import BigNumber from 'bignumber.js';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Touchable from '../Touchable';
import SwapInput from '../../icons/Swap';
import colors from '../../styles/colors';
import fontStyles from '../../styles/fonts';
import { EttaStorageContext } from '../../../storage/context';
import { LocalCurrencySymbol } from '../../utils/currency';
import { DEFAULT_CURRENCY_CODE } from '../../config';
import { useBtcToLocalAmount } from '../../utils/currency';

const DEFAULT_DISPLAY_DECIMALS = 2;

interface Props {
  inputAmount: string;
  btc: BigNumber;
  usingLocalAmount: boolean;
  isOutgoingPaymentRequest: boolean;
  onPressMax: () => void;
  onSwapInput: () => void;
}

function calculateDecimalsToShow(value: BigNumber) {
  const exponent = value?.e ?? 0;
  if (exponent >= 0) {
    return DEFAULT_DISPLAY_DECIMALS;
  }

  return Math.abs(exponent) + 1;
}

// Formats |value| so that it shows at least 2 significant figures and at least 2 decimal places without trailing zeros.
export function formatValueToDisplay(value: BigNumber) {
  let decimals = calculateDecimalsToShow(value);
  let text = value.toFormat(decimals);
  while (text[text.length - 1] === '0' && decimals-- > 2) {
    text = text.substring(0, text.length - 1);
  }
  return text;
}

const AmountValue = ({
  inputAmount,
  btc,
  usingLocalAmount,
  isOutgoingPaymentRequest,
  onPressMax,
  onSwapInput,
}: Props) => {
  const { t } = useTranslation();

  const { prefferedCurrency, btcCurrency } = useContext(EttaStorageContext);

  const getCurrencySymbol = currency => {
    return LocalCurrencySymbol[currency];
  };

  const localCurrencyCode = prefferedCurrency || DEFAULT_CURRENCY_CODE;
  const localCurrencySymbol = getCurrencySymbol(prefferedCurrency);
  const localAmount = useBtcToLocalAmount(btc);

  const secondaryAmount = usingLocalAmount
    ? btc
    : localAmount ?? new BigNumber(0);

  return (
    <>
      <View style={styles.container}>
        {isOutgoingPaymentRequest ? (
          <View style={styles.placeholder} />
        ) : (
          <Touchable
            borderless={true}
            onPress={onPressMax}
            style={styles.pressableButton}
          >
            <Text
              adjustsFontSizeToFit={true}
              maxFontSizeMultiplier={1.618}
              style={styles.button}
            >
              {t('max')}
            </Text>
          </Touchable>
        )}
        <View style={styles.valuesContainer}>
          <View style={styles.valueContainer}>
            {usingLocalAmount && (
              <View style={styles.symbolContainer}>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.mainSymbol}
                >
                  {localCurrencySymbol || localCurrencyCode}
                </Text>
              </View>
            )}
            <View style={styles.amountContainer}>
              <Text
                textBreakStrategy="simple"
                allowFontScaling={false}
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                minimumFontScale={0.4}
                selectable={true}
                ellipsizeMode="tail"
                style={styles.mainAmount}
              >
                {inputAmount ? inputAmount : 0}
              </Text>
            </View>
            {!usingLocalAmount && (
              <View style={styles.symbolContainer}>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.mainSymbol}
                >
                  {btcCurrency}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.valueContainer}>
            {!usingLocalAmount && (
              <View style={styles.symbolContainer}>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.secondarySymbol}
                >
                  {localCurrencySymbol || localCurrencyCode}
                </Text>
              </View>
            )}
            <View style={styles.amountContainer}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.secondaryAmount}
              >
                {formatValueToDisplay(secondaryAmount)}
              </Text>
            </View>
            {usingLocalAmount && (
              <View style={styles.symbolContainer}>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.secondarySymbol}
                >
                  {btcCurrency}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Touchable
          onPress={onSwapInput}
          borderless={true}
          style={styles.pressableButton}
        >
          <SwapInput />
        </Touchable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  valuesContainer: {
    flex: 1,
  },
  valueContainer: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  amountContainer: {
    justifyContent: 'center',
    maxWidth: '85%',
  },
  symbolContainer: {
    justifyContent: 'center',
  },
  button: {
    color: colors.gray4,
    fontSize: 12,
  },
  mainSymbol: {
    ...fontStyles.regular,
    fontSize: 24,
    lineHeight: 64,
  },
  secondarySymbol: {
    ...fontStyles.small,
    marginHorizontal: 2,
  },
  mainAmount: {
    ...fontStyles.regular,
    fontSize: 64,
    lineHeight: undefined,
    fontFamily: 'Jost-Medium',
    fontWeight: 'normal',
    width: '100%',
    paddingRight: 2,
  },
  secondaryAmount: {
    ...fontStyles.small,
    lineHeight: undefined,
  },
  pressableButton: {
    height: 48,
    width: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    height: 48,
    width: 48,
  },
});

export default AmountValue;
