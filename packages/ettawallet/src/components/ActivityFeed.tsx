import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import SectionHead from 'src/components/SectionHead';
import colors from '../styles/colors';
import { Spacing } from '../styles/styles';
import { groupFeedItemsInSections } from '../utils/transactions';

const ActivityFeed = () => {
  const [isLoading, setIsLoading] = useState(false);
  const transactions = [];

  const sections = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    return groupFeedItemsInSections(transactions);
  }, [transactions.map(tx => tx.transactionHash).join(',')]);

  if (!transactions.length) {
    return (
      <View style={styles.container}>
        {isLoading && (
          <ActivityIndicator
            style={styles.icon}
            size="large"
            color={colors.greenBrand}
          />
        )}
        <Text style={styles.text}>{t('noTransactionActivity')} </Text>
      </View>
    );
  }

  const renderItem = () => {
    <TransferFeedItem key={tx.transactionHash} transfer={tx} />;
  };

  return (
    <>
      <SectionList
        renderItem={renderItem}
        renderSectionHeader={item => <SectionHead text={item.section.title} />}
        sections={sections}
        keyExtractor={item =>
          `${item.transactionHash}-${item.timestamp.toString()}`
        }
        keyboardShouldPersistTaps="always"
        testID="TransactionList"
        onEndReached={() => fetchMoreTransactions()}
      />
      {fetchingMoreTransactions && (
        <View style={styles.centerContainer}>
          <ActivityIndicator
            style={styles.loadingIcon}
            size="large"
            color={colors.greenBrand}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingIcon: {
    marginVertical: Spacing.Thick24,
    height: 108,
    width: 108,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default ActivityFeed;
