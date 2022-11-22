import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Touchable from './Touchable';
import SwapIcon from '../icons/SwapIcon';
import { navigate } from '../navigation/NavigationService';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';
import variables from '../styles/variables';
import { useSatsToLocalAmount } from '../utils/currency';
import { getDatetimeDisplayString } from '../utils/time';
import i18n from '../../i18n';

const TransactionFeedItem = transaction => {
  const { t } = useTranslation();

  const getLocalFiatValue = sats => {
    const localAmount = useSatsToLocalAmount(sats);
    return localAmount;
  };

  const formatTimestamp = timestamp => {
    const d = getDatetimeDisplayString(timestamp, i18n);
    return d;
  };

  const handleTransferDetails = () => {
    navigate('TransactionDetails', { transaction: transaction });
  };

  const getTransactionTitle = transactionData => {
    let title;
    if (transactionData.transaction.sent === '0') {
      title = t('transactionFeed.receivedHeader');
    } else if (transactionData.transaction.received === '0') {
      title = t('transactionFeed.sentHeader');
    } else {
      title = t('unknown');
    }
    return title;
  };

  const getTransactionAmount = transactionData => {
    let amount;
    if (transactionData.transaction.sent !== '0') {
      amount = '-' + transactionData.transaction.sent;
    } else if (transactionData.transaction.received !== '0') {
      amount = '+' + transactionData.transaction.received;
    } else {
      amount = 0;
    }
    return amount;
  };

  return (
    <Touchable onPress={handleTransferDetails}>
      <View style={styles.container}>
        <SwapIcon />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{getTransactionTitle(transaction)}</Text>
          <Text style={styles.subtitle}>
            {formatTimestamp(transaction.transaction.confirmation_time)}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: colors.greenUI }]}>
            {getTransactionAmount(transaction)}
          </Text>
          {/* Show amount in local currency */}
          <Text style={[styles.localAmount, { color: colors.gray4 }]}>
            {getLocalFiatValue(getTransactionAmount(transaction))}
          </Text>
        </View>
      </View>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 12,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: variables.contentPadding,
  },
  title: {
    ...fontStyles.regular500,
    flexShrink: 1,
  },
  subtitle: {
    ...fontStyles.small,
    color: colors.gray4,
    paddingTop: 2,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amount: {
    ...fontStyles.regular500,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  localAmount: {
    ...fontStyles.small500,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  tokenAmount: {
    ...fontStyles.small,
    color: colors.gray4,
    paddingTop: 2,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
});

export default TransactionFeedItem;
