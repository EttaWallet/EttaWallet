import { Colors, Icon, TypographyPresets } from 'etta-ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useStoreState } from '../../state/hooks';
import { ELocalCurrencySymbol } from '../../utils/types';
import BigNumber from 'bignumber.js';
import { convertLocalAmountToSats, convertSatsToLocalAmount } from '../../utils/hooks';

interface Props {
  totalAmount: number;
  usingLocalCurrency: boolean;
}

const TotalAmountDisplay = ({ totalAmount, usingLocalCurrency }: Props) => {
  const [valueInLocalCurrency, setValueInLocalCurrency] = useState(new BigNumber(0));
  const [valueInSats, setValueInSats] = useState(new BigNumber(0));
  const preferredCurrencyCode = useStoreState((state) => state.nuxt.localCurrency);
  const preferredCurrencySymbol = ELocalCurrencySymbol[preferredCurrencyCode!];
  const exchangeRate = useStoreState((state) => state.nuxt.exchangeRate.value);

  useEffect(() => {
    async function formatInputAmount() {
      if (preferredCurrencyCode !== null) {
        const amountInLocal = convertSatsToLocalAmount(totalAmount, exchangeRate);
        setValueInLocalCurrency(amountInLocal!);

        const amountInSats = convertLocalAmountToSats(totalAmount, exchangeRate);
        setValueInSats(amountInSats!);
      } else {
        setValueInLocalCurrency(new BigNumber(totalAmount));
        setValueInSats(new BigNumber(totalAmount));
      }
    }

    formatInputAmount();
  }, [totalAmount, preferredCurrencyCode, exchangeRate]);

  const secondaryAmount = usingLocalCurrency
    ? valueInSats
    : valueInLocalCurrency ?? new BigNumber(0);

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
                <Icon name="icon-satoshi-v2" style={styles.btcIcon} />
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
                {totalAmount ? totalAmount.toLocaleString() : 0}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  valuesContainer: {
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
  },
  amountContainer: {
    justifyContent: 'center',
  },
  symbolContainer: {
    justifyContent: 'center',
  },
  mainSymbol: {
    ...TypographyPresets.Body3,
  },
  secondarySymbol: {
    ...TypographyPresets.Body3,
    paddingHorizontal: 2,
    color: Colors.neutrals.light.neutral7,
  },
  mainAmount: {
    ...TypographyPresets.Header3,
    width: '100%',
    paddingRight: 2,
  },
  secondaryAmount: {
    ...TypographyPresets.Body3,
    color: Colors.neutrals.light.neutral7,
  },
  btcIcon: {
    fontSize: 24,
    color: '#ff9d00',
    marginHorizontal: -3,
  },
});

export default TotalAmountDisplay;
