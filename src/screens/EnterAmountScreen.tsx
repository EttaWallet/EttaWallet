import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerWithBackButton } from '../navigation/Headers';
import { Button, Chip } from 'etta-ui';
import AmountKeypad from '../components/amount/AmountKeyPad';
import AmountDisplay from '../components/amount/AmountDisplay';
import { moderateScale } from '../utils/sizing';
import { useStoreState } from '../state/hooks';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import BigNumber from 'bignumber.js';
import { convertLocalAmountToSats } from '../utils/hooks';

const EnterAmountScreen = () => {
  const [amountEntered, setAmountEntered] = useState('');
  const [amountInSats, setAmountInSats] = useState(new BigNumber(0));
  const preferredCurrencyCode = useStoreState((state) => state.nuxt.localCurrency);
  const [isUsingLocalCurrency, setIsUsingLocalCurrency] = useState(!!preferredCurrencyCode);
  const exchangeRate = useStoreState((state) => state.nuxt.exchangeRate.value);

  useEffect(() => {
    async function formatAmount() {
      if (isUsingLocalCurrency) {
        const amountEnteredInSats = convertLocalAmountToSats(amountEntered, exchangeRate);
        setAmountInSats(new BigNumber(amountEnteredInSats!));
      } else {
        setAmountInSats(new BigNumber(amountEntered));
      }
    }

    formatAmount();
  }, [amountEntered, exchangeRate, isUsingLocalCurrency]);

  const onPressContinue = () => {
    cueInformativeHaptic();
    // update invoice fees if necessary
    // getFeesPayable().then();
    requestAnimationFrame(() => {
      navigate(Screens.ReviewRequestScreen, {
        amount: isUsingLocalCurrency ? amountInSats.toString() : amountEntered, // @todo, parse this value so that we are only taking the amount in sats
      });
    });
  };

  const onAmountChange = (updatedAmount: string) => {
    setAmountEntered(updatedAmount);
  };

  const onPressCurrencySwitch = () => {
    onAmountChange('');
    setIsUsingLocalCurrency(!isUsingLocalCurrency);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.contentContainer}>
        <AmountDisplay inputAmount={amountEntered} usingLocalCurrency={isUsingLocalCurrency} />
        {preferredCurrencyCode !== null ? (
          <Chip icon="icon-flip-vertical" onPress={onPressCurrencySwitch} style={styles.switchBtn}>
            {isUsingLocalCurrency ? 'Switch to sats' : `Switch to ${preferredCurrencyCode}`}
          </Chip>
        ) : null}
        <AmountKeypad amount={amountEntered} maxDecimals={2} onAmountChange={onAmountChange} />
      </View>
      <Button
        title="Continue"
        style={styles.button}
        appearance="filled"
        onPress={onPressContinue}
        disabled={!amountEntered}
      />
    </SafeAreaView>
  );
};

EnterAmountScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: moderateScale(16),
  },
  button: {
    justifyContent: 'center',
    marginBottom: 32,
    marginHorizontal: moderateScale(32),
  },
  switchBtn: {
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default EnterAmountScreen;
