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

  const pending = data.map(txs => txs['pending']);
  const confirmed = data.map(txs => txs['confirmed']);

  const keyExtractor = (item: any) => {
    const id = item.map(k => k.txid);
    return id;
  };

  const sections = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    return groupFeedItemsInSections(data.map(k => k['confirmed'])); // currently on getting confirmed transactions only. Need all.
  }, [
    data
      .map(k => k['confirmed'])
      .map(c => c.txid)
      .join(','),
  ]);

  if (!data.length) {
    return <NoTransactions />;
  }

  const renderItem = ({ item: tx }: { item: any; index: number }) => {
    console.log('item: ', tx);
    return tx.map((value, index) => (
      <TransactionFeedItem key={value.txid} transaction={value} />
    ));
  };

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
        renderSectionHeader={item => (
          <SectionHeader style={{ marginTop: 20 }} text={item.section.title} />
        )}
        sections={sections}
        keyExtractor={keyExtractor}
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
