import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { StyleSheet, StyleProp, TextStyle, Text } from 'react-native';
import { EttaStorageContext } from '../../storage/context';
import { useSatsToLocalAmount } from '../utils/currency';
import fontStyles from '../styles/fonts';
import variables from '../styles/variables';
import colors from '../styles/colors';

const WalletBalance = ({
  style = styles.balance,
}: {
  style?: StyleProp<TextStyle>;
}) => {
  const { t } = useTranslation();
  const { btcCurrency, bdkWalletBalance } = useContext(EttaStorageContext);

  const btcBalance = BigNumber(bdkWalletBalance); // retrieve from state via context

  const localAmount = useSatsToLocalAmount(btcBalance, true);
  const totalLocalBalance = localAmount;
  const totalBitcoinBalance = btcBalance;

  const [balanceFetchError, setBalanceFetchError] = useState('');
  const [balanceIsStale, setBalanceIsStale] = useState(false);
  const [balanceFetchLoading, setBalanceFetchLoading] = useState(false);

  if (balanceFetchError || balanceFetchLoading || balanceIsStale) {
    // Shown if balance is stale or hasn't been fetched yet.
    return <Text style={style}>{'-'}</Text>;
  } else {
    return (
      <>
        <Text style={styles.totalBalanceHeader}>
          {t('walletHome.totalBalanceHeader')}
        </Text>
        <Text style={style}>
          {totalBitcoinBalance?.toFormat(2) ?? new BigNumber(0).toFormat(3)}
          &nbsp;{btcCurrency}
        </Text>
        <Text style={styles.localBalance}>{totalLocalBalance}</Text>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    margin: variables.contentPadding,
  },
  balance: {
    ...fontStyles.largeNumber,
  },
  localBalance: {
    ...fontStyles.mediumNumber,
    color: colors.gray4,
    paddingRight: 5,
  },
  totalBalanceHeader: {
    ...fontStyles.sectionHeader,
    color: colors.gray4,
    paddingRight: 5,
  },
});

export default WalletBalance;
