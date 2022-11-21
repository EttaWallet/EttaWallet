/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useEffect, useMemo, useState } from 'react';
import BdkRn from 'bdk-rn';
import { ActivityIndicator, SectionList, StyleSheet, View } from 'react-native';
import SectionHeader from './SectionHeader';
import colors from '../styles/colors';
import { Spacing } from '../styles/styles';
import TransactionFeedItem from './TransactionFeedItem';
import NoTransactions from './NoTransactions';
import { groupFeedItemsInSections } from '../utils/transactions';

const TransactionFeed = ({ data }) => {
  const [fetchingMoreTransactions, setFetchingMoreTransactions] =
    useState(false);

  const sections = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    return groupFeedItemsInSections(data);
  }, [data.map(tx => tx.txid).join(',')]);

  if (!data.length) {
    return <NoTransactions />;
  }

  function renderItem({ item: tx }) {
    return <TransactionFeedItem key={tx.txid} transaction={tx} />;
  }

  const fetchMoreTransactions = () => {
    setFetchingMoreTransactions(true);
    setTimeout(() => {
      return 0;
    }, 5000);
  };

  return (
    <>
      <SectionList
        renderItem={renderItem}
        renderSectionHeader={() => (
          <SectionHeader style={{ marginTop: 20 }} text="Recent transactions" />
        )}
        sections={sections}
        keyExtractor={item => `${item.txid}`}
        keyboardShouldPersistTaps="always"
        onEndReached={() => fetchMoreTransactions} // do nothing? but should def fetch more?
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

export default TransactionFeed;
