import { Colors, Icon, TypographyPresets } from 'etta-ui';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useStoreState } from '../../state/hooks';
import { ELocalCurrencySymbol } from '../../utils/types';
import { localCurrencyToSats, satsToLocalCurrency } from '../../utils/helpers';

interface Props {
  inputAmount: string;
  usingLocalCurrency: boolean;
  receivedPayment?: boolean;
}

const AmountDisplay = ({ inputAmount, usingLocalCurrency, receivedPayment }: Props) => {
  const [valueInLocalCurrency, setValueInLocalCurrency] = useState(0);
  const [valueInSats, setValueInSats] = useState(0);
  const preferredCurrencyCode = useStoreState((state) => state.nuxt.localCurrency);
  const preferredCurrencySymbol = ELocalCurrencySymbol[preferredCurrencyCode!];

  useEffect(() => {
    async function formatInputAmount() {
      if (preferredCurrencyCode !== null) {
        const amountInLocal = await satsToLocalCurrency({
          amountInSats: parseInt(inputAmount ? inputAmount : '0', 10),
        });
        setValueInLocalCurrency(amountInLocal);

        const amountInSats = await localCurrencyToSats({
          localAmount: parseInt(inputAmount ? inputAmount : '0', 10),
        });
        setValueInSats(amountInSats);
      } else {
        setValueInLocalCurrency(parseInt(inputAmount ? inputAmount : '0', 10));
        setValueInSats(parseInt(inputAmount ? inputAmount : '0', 10));
      }
    }

    formatInputAmount();
  }, [inputAmount, preferredCurrencyCode]);

  const secondaryAmount = usingLocalCurrency ? valueInSats : valueInLocalCurrency ?? 0;

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
                    receivedPayment ? { color: Colors.green.base } : { color: Colors.orange.base },
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
                style={receivedPayment ? styles.receivedPayment : styles.mainAmount}
              >
                {inputAmount ? inputAmount.toLocaleString() : 0}
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
                  {secondaryAmount.toLocaleString()}
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
  },
  amountContainer: {
    justifyContent: 'center',
    maxWidth: '90%',
  },
  symbolContainer: {
    justifyContent: 'center',
  },
  mainSymbol: {
    ...TypographyPresets.Body1,
  },
  secondarySymbol: {
    ...TypographyPresets.Body3,
    marginHorizontal: 2,
    color: Colors.neutrals.light.neutral7,
  },
  mainAmount: {
    ...TypographyPresets.Header1,
    fontFamily: fontFamilyChoice,
    width: '100%',
  },
  secondaryAmount: {
    ...TypographyPresets.Body2,
    fontFamily: fontFamilyChoice,
    color: Colors.neutrals.light.neutral7,
  },
  receivedPayment: {
    ...TypographyPresets.Header1,
    fontFamily: fontFamilyChoice,
    width: '100%',
    color: Colors.green.base,
  },
  btcIcon: {
    fontSize: 32,
  },
});

export default AmountDisplay;
