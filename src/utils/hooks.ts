import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import store from '../state/store';
import { CLIPBOARD_CHECK_INTERVAL, DEFAULT_NUMBER_OF_DECIMALS } from '../../config';
import Clipboard from '@react-native-clipboard/clipboard';
import { AppState, Platform } from 'react-native';
import Logger from './logger';

function calculateDecimals(value: BigNumber) {
  const exponent = value?.e ?? 0;
  if (exponent >= 0) {
    return DEFAULT_NUMBER_OF_DECIMALS;
  }

  return Math.abs(exponent) + 1;
}

export function formatMoneyDisplay(value: BigNumber) {
  let decimals = calculateDecimals(value);
  let BN = value.toFormat(decimals, BigNumber.ROUND_DOWN, {
    decimalSeparator: '.',
    groupSeparator: ',',
  });
  // remove trailing zeros
  while (BN[BN.length - 1] === '0' && decimals-- > 2) {
    BN = BN.substring(0, BN.length - 1);
  }
  return BN;
}

export function convertLocalAmountToSats(
  amount: BigNumber.Value | null,
  exchangeRate: BigNumber.Value | null | undefined
) {
  if (!amount || !exchangeRate) {
    return null;
  }

  const formattedAmount = formatMoneyDisplay(
    new BigNumber(amount).multipliedBy(100000000).dividedBy(exchangeRate)
  );
  return new BigNumber(formattedAmount);
}

export function convertSatsToLocalAmount(
  amount: BigNumber.Value | null,
  exchangeRate: BigNumber.Value | null | undefined
) {
  if (!amount || !exchangeRate) {
    return null;
  }

  const formattedAmount = formatMoneyDisplay(
    new BigNumber(amount).dividedBy(100000000).multipliedBy(exchangeRate)
  );
  return new BigNumber(formattedAmount);
}

export function useLocalAmountToSats(amount: BigNumber): BigNumber | null {
  const exchangeRate = store.getState().nuxt.exchangeRate.value;
  return useMemo(() => convertLocalAmountToSats(amount, exchangeRate), [amount, exchangeRate]);
}

export function useSatsToLocalAmount(amount: BigNumber): BigNumber | null {
  const exchangeRate = store.getState().nuxt.exchangeRate.value;
  return useMemo(() => convertSatsToLocalAmount(amount, exchangeRate), [amount, exchangeRate]);
}

export const deviceIsIos14OrNewer = () => {
  const iosVersion = parseFloat(Platform.Version.toString());
  return Platform.OS === 'ios' && iosVersion >= 14;
};

export function useClipboard(): [boolean, string, () => Promise<string>] {
  const [forceShowingPasteIcon, setForceShowingPasteIcon] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function checkClipboardContent() {
      try {
        if (deviceIsIos14OrNewer()) {
          setForceShowingPasteIcon(await Clipboard.hasString());
          return;
        }

        const newClipboardContent = await Clipboard.getString();
        if (!isMounted) {
          return;
        }

        setClipboardContent(newClipboardContent);
      } catch (error) {
        Logger.error('useClipboard', 'Error checking clipboard contents', error);
      }
    }

    const interval = setInterval(checkClipboardContent, CLIPBOARD_CHECK_INTERVAL);

    const appStateListener = AppState.addEventListener('change', checkClipboardContent);

    checkClipboardContent().catch(() => {
      // Ignored
    });

    return () => {
      isMounted = false;
      appStateListener.remove();
      clearInterval(interval);
    };
  }, []);

  return [forceShowingPasteIcon, clipboardContent, Clipboard.getString];
}
