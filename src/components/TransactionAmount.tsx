import { Colors, Icon, TypographyPresets } from 'etta-ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useStoreState } from '../state/hooks';
import { ELocalCurrencySymbol, EPaymentType } from '../utils/types';
import { localCurrencyToSats, satsToLocalCurrency } from '../utils/helpers';
import BigNumber from 'bignumber.js';

interface Props {
  totalAmount: number;
  usingLocalCurrency: boolean;
  transactionType: EPaymentType;
}

const TransactionAmount = ({ totalAmount, usingLocalCurrency, transactionType }: Props) => {
  const [valueInLocalCurrency, setValueInLocalCurrency] = useState(0);
  const [valueInSats, setValueInSats] = useState(0);
  const preferredCurrencyCode = useStoreState((state) => state.nuxt.localCurrency);
  const preferredCurrencySymbol = ELocalCurrencySymbol[preferredCurrencyCode!];

  const transactionSign = (txType: EPaymentType) => {
    let symbol: string;
    if (txType === EPaymentType.received) {
      symbol = '+';
    } else {
      symbol = '-';
    }
    return symbol;
  };

  const sign = transactionSign(transactionType);

  useEffect(() => {
    async function formatInputAmount() {
      if (preferredCurrencyCode !== null) {
        const amountInLocal = await satsToLocalCurrency({
          amountInSats: totalAmount,
        });
        setValueInLocalCurrency(amountInLocal);

        const amountInSats = await localCurrencyToSats({
          localAmount: totalAmount,
        });
        setValueInSats(amountInSats);
      } else {
        setValueInLocalCurrency(totalAmount);
        setValueInSats(totalAmount);
      }
    }

    formatInputAmount();
  }, [totalAmount, preferredCurrencyCode]);

  const secondaryAmount = usingLocalCurrency
    ? valueInSats
    : valueInLocalCurrency ?? new BigNumber(0);

  return (
    <>
      <View style={styles.container}>
        <View>
          <View style={styles.valueContainer}>
            {usingLocalCurrency && (
              <View style={styles.symbolContainer}>
                <Text
                  allowFontScaling={false}
                  adjustsFontSizeToFit={true}
                  numberOfLines={1}
                  style={[styles.mainSymbol, sign === '+' ? { color: Colors.green.base } : null]}
                >
                  {sign}
                  {preferredCurrencySymbol || preferredCurrencyCode}
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
                style={[
                  styles.mainAmount,
                  sign === '+' ? { color: Colors.green.base } : { color: Colors.red.base },
                ]}
              >
                {sign}
                {totalAmount ? totalAmount.toLocaleString() : 0}
              </Text>
            </View>
            {!usingLocalCurrency && (
              <View style={styles.symbolContainer}>
                <Icon
                  name="icon-satoshi-v2"
                  style={[
                    styles.btcIcon,
                    sign === '+' ? { color: Colors.green.base } : { color: Colors.red.base },
                  ]}
                />
              </View>
            )}
          </View>
          {preferredCurrencyCode !== null ? (
            <View style={styles.valueContainer}>
              <View style={styles.amountContainer}>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.secondaryAmount}>
                  {sign}
                  {secondaryAmount.toLocaleString()}
                </Text>
              </View>
              {!usingLocalCurrency && (
                <View style={styles.symbolContainer}>
                  <Text
                    allowFontScaling={false}
                    adjustsFontSizeToFit={true}
                    numberOfLines={1}
                    style={styles.secondarySymbol}
                  >
                    {preferredCurrencySymbol || preferredCurrencyCode}
                  </Text>
                </View>
              )}
              {usingLocalCurrency && (
                <View style={styles.symbolContainer}>
                  <Icon
                    name="icon-satoshi-v2"
                    style={[
                      styles.btcIcon,
                      sign === '+' ? { color: Colors.green.base } : { color: Colors.red.base },
                    ]}
                  />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
  },
  amountContainer: {
    justifyContent: 'center',
    maxWidth: '90%',
  },
  symbolContainer: {
    justifyContent: 'center',
  },
  mainSymbol: {
    ...TypographyPresets.Body4,
    paddingHorizontal: 2,
  },
  secondarySymbol: {
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 2,
    color: Colors.neutrals.light.neutral7,
  },
  mainAmount: {
    ...TypographyPresets.Body3,
    width: '100%',
  },
  secondaryAmount: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
  },
  btcIcon: {
    fontSize: 24,
    lineHeight: 24,
    marginHorizontal: -3,
  },
});

export default TransactionAmount;
