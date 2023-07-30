import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerWithBackButton } from '../navigation/Headers';
import { Button, Chip, Colors } from 'etta-ui';
import AmountKeypad from '../components/amount/AmountKeyPad';
import AmountDisplay from '../components/amount/AmountDisplay';
import { moderateScale } from '../utils/sizing';
import { useStoreState } from '../state/hooks';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import BigNumber from 'bignumber.js';
import { convertLocalAmountToSats } from '../utils/hooks';
import { modalScreenOptions } from '../navigation/Navigator';

const EnterAmountScreen = ({ navigation }) => {
  const [amountEntered, setAmountEntered] = useState('');
  const [amountInSats, setAmountInSats] = useState(new BigNumber(0));
  const preferredCurrencyCode = useStoreState((state) => state.nuxt.localCurrency);
  const [isUsingLocalCurrency, setIsUsingLocalCurrency] = useState(!!preferredCurrencyCode);
  const exchangeRate = useStoreState((state) => state.nuxt.exchangeRate.value);
  const totalReceivable = useStoreState((state) => state.lightning.maxReceivable);
  const [showMaxReceivable, setShowMaxReceivable] = useState(false);

  useLayoutEffect(() => {
    const onPressCurrencySwitch = () => {
      onAmountChange('');
      setIsUsingLocalCurrency(!isUsingLocalCurrency);
    };

    navigation.setOptions({
      headerRight: () => {
        return (
          preferredCurrencyCode !== null && (
            <Chip
              icon="icon-flip-vertical"
              onPress={onPressCurrencySwitch}
              style={styles.switchBtn}
            >
              {isUsingLocalCurrency ? 'Use sats' : `Use ${preferredCurrencyCode}`}
            </Chip>
          )
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUsingLocalCurrency, navigation, preferredCurrencyCode]);

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

  useEffect(() => {
    if (amountInSats.toNumber() > totalReceivable) {
      setShowMaxReceivable(true);
    } else {
      setShowMaxReceivable(false);
    }
  }, [amountInSats, totalReceivable]);

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
    if (parseInt(updatedAmount, 10) > totalReceivable) {
      cueInformativeHaptic();
    }
    setAmountEntered(updatedAmount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.contentContainer}>
        <AmountDisplay inputAmount={amountEntered} usingLocalCurrency={isUsingLocalCurrency} />
        {/* {preferredCurrencyCode !== null ? (
          <Chip icon="icon-flip-vertical" onPress={onPressCurrencySwitch} style={styles.switchBtn}>
            {isUsingLocalCurrency ? 'Switch to sats' : `Switch to ${preferredCurrencyCode}`}
          </Chip>
        ) : null} */}
        <Button
          title="Continue"
          style={styles.button}
          appearance="filled"
          onPress={onPressContinue}
          disabled={!amountEntered}
        />

        {showMaxReceivable && (
          <View style={styles.receivableSection}>
            <Text
              numberOfLines={2}
              style={styles.receivable}
            >{`Amount exceeds your current receiving capacity: ${totalReceivable.toLocaleString()} sats. You may incur a fee to increase capacity`}</Text>
          </View>
        )}
        <View style={styles.keyPad}>
          <AmountKeypad amount={amountEntered} maxDecimals={2} onAmountChange={onAmountChange} />
        </View>
      </View>
    </SafeAreaView>
  );
};

EnterAmountScreen.navigationOptions = () => ({
  ...modalScreenOptions(),
  ...headerWithBackButton,
  gestureEnabled: false,
});

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
    marginBottom: 24,
    marginHorizontal: moderateScale(16),
  },
  switchBtn: {
    alignItems: 'center',
  },
  keyPad: {
    marginBottom: 32,
  },
  receivableSection: {
    justifyContent: 'center',
  },
  receivable: {
    textAlign: 'center',
    color: Colors.orange.base,
  },
});

export default EnterAmountScreen;
