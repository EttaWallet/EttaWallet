import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import AmountDisplay from './Transact/AmountDisplay';
import Touchable from './Touchable';
import ForwardChevron from '../icons/ForwardChevron';
import { navigate } from '../navigation/NavigationService';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';
import variables from '../styles/variables';

const TransactionFeedItem = ({ transaction }) => {
  const { t } = useTranslation();

  const handleTransferDetails = () => {
    navigate('TransactionDetails', { transaction: transaction });
  };

  return (
    <Touchable onPress={handleTransferDetails}>
      <View style={styles.container}>
        <ForwardChevron />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Received/Sent</Text>
          <Text style={styles.subtitle}>{transaction.txid}</Text>
        </View>
        <View style={styles.tokenAmountContainer}>
          <AmountDisplay
            amount={transaction.received}
            showLocalAmount={false}
            showSymbol={true}
            showExplicitPositiveSign={true}
            hideSign={false}
            style={[styles.amount, { color: colors.greenUI }]}
          />
          <AmountDisplay
            amount={-transaction.sent}
            showLocalAmount={false}
            showSymbol={true}
            hideSign={false}
            style={styles.tokenAmount}
          />
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
    paddingHorizontal: variables.contentPadding,
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
  tokenAmountContainer: {
    flex: 1,
    marginLeft: variables.contentPadding,
    paddingLeft: 10,
    alignItems: 'flex-end',
  },
  amount: {
    ...fontStyles.regular500,
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
