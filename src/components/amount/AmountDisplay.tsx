import { Colors, Icon, TypographyPresets } from 'etta-ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useStoreState } from '../../state/hooks';
import { ELocalCurrencySymbol, EPaymentType } from '../../utils/types';
import { convertLocalAmountToSats, convertSatsToLocalAmount } from '../../utils/hooks';
import BigNumber from 'bignumber.js';
import * as RNLocalize from 'react-native-localize';

interface Props {
  inputAmount: string;
  usingLocalCurrency: boolean;
  paymentType?: EPaymentType;
}

const AmountDisplay = ({ inputAmount, usingLocalCurrency, paymentType }: Props) => {
  const [valueInLocalCurrency, setValueInLocalCurrency] = useState(new BigNumber(0));
  const [valueInSats, setValueInSats] = useState(new BigNumber(0));
  const preferredCurrencyCode = useStoreState((state) => state.nuxt.localCurrency);
  const preferredCurrencySymbol = ELocalCurrencySymbol[preferredCurrencyCode!];
  const exchangeRate = useStoreState((state) => state.nuxt.exchangeRate.value);

  useEffect(() => {
    async function formatInputAmount() {
      if (preferredCurrencyCode !== null) {
        const amountInLocal = convertSatsToLocalAmount(inputAmount, exchangeRate);
        setValueInLocalCurrency(amountInLocal!);

        const amountInSats = convertLocalAmountToSats(inputAmount, exchangeRate);
        setValueInSats(amountInSats!);
      } else {
        setValueInLocalCurrency(new BigNumber(inputAmount));
        setValueInSats(new BigNumber(inputAmount));
      }
    }

    formatInputAmount();
  }, [exchangeRate, inputAmount, preferredCurrencyCode]);

  const secondaryAmount = usingLocalCurrency
    ? valueInSats
    : valueInLocalCurrency ?? new BigNumber(0);

  const formatStringToLocale = (value) => {
    const deviceLocale = RNLocalize.getLocales()[0].languageTag;
    return new Intl.NumberFormat(deviceLocale).format(value);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.valuesContainer}>
          <View style={styles.valueContainer}>
            {usingLocalCurrency && (
              <View style={styles.symbolContainer}>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={styles.mainSymbol}
                >
                  {preferredCurrencySymbol || preferredCurrencyCode}
                </Text>
              </View>
            )}
            {!usingLocalCurrency && (
              <View style={styles.symbolContainer}>
                <Icon
                  name="icon-satoshi-v2"
                  style={[
                    styles.btcIcon,
                    {
                      color:
                        paymentType === EPaymentType.received
                          ? Colors.green.base
                          : paymentType === EPaymentType.sent
                          ? Colors.red.base
                          : Colors.orange.base,
                    },
                  ]}
                />
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
                style={
                  paymentType === EPaymentType.received
                    ? styles.receivedPayment
                    : paymentType === EPaymentType.sent
                    ? styles.sentPayment
                    : styles.mainAmount
                }
              >
                {inputAmount ? formatStringToLocale(inputAmount) : 0}
              </Text>
            </View>
          </View>
          {preferredCurrencyCode !== null ? (
            <View style={styles.valueContainer}>
              {!usingLocalCurrency && (
                <View style={styles.symbolContainer}>
                  <Text
                    allowFontScaling={false}
                    adjustsFontSizeToFit={true}
                    numberOfLines={1}
                    style={styles.secondarySymbol}
                  >
                    {'~ '}
                    {preferredCurrencySymbol || preferredCurrencyCode}
                  </Text>
                </View>
              )}
              <View style={styles.amountContainer}>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.secondaryAmount}>
                  {secondaryAmount ? secondaryAmount.toFormat() : '0'}
                </Text>
              </View>
              {usingLocalCurrency && (
                <View style={styles.symbolContainer}>
                  <Icon name="icon-satoshi-v2" style={styles.btcIcon} />
                </View>
              )}
            </View>
          ) : null}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountContainer: {
    maxWidth: '90%',
  },
  symbolContainer: {
    justifyContent: 'center',
  },
  mainSymbol: {
    ...TypographyPresets.Body1,
    color: Colors.neutrals.light.neutral7,
  },
  secondarySymbol: {
    ...TypographyPresets.Body3,
    paddingRight: 2,
  },
  mainAmount: {
    ...TypographyPresets.Header1,
    width: '100%',
  },
  secondaryAmount: {
    ...TypographyPresets.Body3,
  },
  receivedPayment: {
    ...TypographyPresets.Header1,
    width: '100%',
    color: Colors.green.base,
  },
  sentPayment: {
    ...TypographyPresets.Header1,
    width: '100%',
    color: Colors.red.base,
  },
  btcIcon: {
    fontSize: 32,
    color: Colors.neutrals.light.neutral7,
    marginHorizontal: -3,
  },
});

export default AmountDisplay;
