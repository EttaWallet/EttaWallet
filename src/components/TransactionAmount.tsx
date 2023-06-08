import { Colors, Icon, TypographyPresets } from 'etta-ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useStoreState } from '../state/hooks';
import { ELocalCurrencySymbol, EPaymentType } from '../utils/types';
import { localCurrencyToSats, satsToLocalCurrency } from '../utils/helpers';

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

  const sign = transactionType === EPaymentType.sent ? '+' : '-';

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

  const secondaryAmount = usingLocalCurrency ? valueInSats : valueInLocalCurrency ?? 0;

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
                style={[styles.mainAmount, sign === '+' ? { color: Colors.green.base } : null]}
              >
                {totalAmount ? totalAmount : 0}
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
                    {preferredCurrencySymbol || preferredCurrencyCode}
                  </Text>
                </View>
              )}
              <View style={styles.amountContainer}>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.secondaryAmount}>
                  {secondaryAmount}
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

const fontFamilyChoice = Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace';

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
    marginHorizontal: 2,
  },
  secondarySymbol: {
    ...TypographyPresets.Body5,
    marginHorizontal: 2,
    color: Colors.neutrals.light.neutral7,
  },
  mainAmount: {
    ...TypographyPresets.Body4,
    fontFamily: fontFamilyChoice,
    width: '100%',
    paddingRight: 2,
  },
  secondaryAmount: {
    ...TypographyPresets.Body5,
    fontFamily: fontFamilyChoice,
    color: Colors.neutrals.light.neutral7,
  },
  btcIcon: {
    fontSize: 24,
    color: '#ff9d00',
  },
});

export default TransactionAmount;
