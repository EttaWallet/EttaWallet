/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo } from 'react';
import { getNumberFormatSettings } from 'react-native-localize';
import Keypad from '../KeyPad';

const { decimalSeparator } = getNumberFormatSettings();

interface Props {
  amount: string;
  maxDecimals: number;
  onAmountChange: (amount: string) => void;
}

const AmountKeypad = ({ amount, maxDecimals, onAmountChange }: Props) => {
  const maxLength = useMemo(() => {
    const decimalPos = amount.indexOf(decimalSeparator ?? '.');
    if (decimalPos === -1) {
      return null;
    }
    return decimalPos + maxDecimals + 1;
  }, [amount, maxDecimals, decimalSeparator]);

  const onDigitPress = useCallback(
    (digit: number) => {
      if ((amount === '' && digit === 0) || (maxLength && amount.length + 1 > maxLength)) {
        return;
      }
      onAmountChange(amount + digit.toString());
    },
    [amount, maxLength, onAmountChange]
  );

  const onBackspacePress = useCallback(() => {
    onAmountChange(amount.substr(0, amount.length - 1));
  }, [amount, onAmountChange]);

  const onBackspaceLongPress = useCallback(() => {
    onAmountChange('');
  }, [amount, onAmountChange]);

  const onDecimalPress = useCallback(() => {
    const decimalPos = amount.indexOf(decimalSeparator ?? '.');
    if (decimalPos !== -1) {
      return;
    }

    if (!amount) {
      onAmountChange('0' + decimalSeparator);
    } else {
      onAmountChange(amount + decimalSeparator);
    }
  }, [amount, onAmountChange]);

  return (
    <Keypad
      onDigitPress={onDigitPress}
      onBackspacePress={onBackspacePress}
      onBackspaceLongPress={onBackspaceLongPress}
      decimalSeparator={decimalSeparator}
      onDecimalPress={onDecimalPress}
    />
  );
};

export default AmountKeypad;
