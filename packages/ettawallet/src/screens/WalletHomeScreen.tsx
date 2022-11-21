import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  RefreshControl,
  RefreshControlProps,
  SectionList,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { noHeader } from '../navigation/headers/Headers';
import WalletHeader from '../navigation/headers/WalletHeader';
import colors from '../styles/colors';
import WalletBalance from '../components/WalletBalance';
import variables from '../styles/variables';
import SuggestionBox from '../components/SuggestionBox';
import fontStyles from '../styles/fonts';
import { EttaStorageContext } from '../../storage/context';
import BdkRn from 'bdk-rn';
import TransactionFeed from '../components/TransactionFeed';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const WalletHome = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedTransactions, setFetchedTransactions] = useState([]);

  const { getBdkWalletBalance } = useContext(EttaStorageContext);

  const onRefresh = async () => {
    syncWallet();
    getBdkWalletBalance();
  };

  const syncWallet = async () => {
    try {
      const { data } = await BdkRn.syncWallet();
      console.log(data); // sync status
    } catch (e) {
      console.log(e);
    }
  };

  const getBdkTransactions = async () => {
    try {
      const { data } = await BdkRn.getTransactions();
      setFetchedTransactions[data];
      console.log('fetched: ', data);
    } catch (e) {
      console.log(e);
    }
  };

  const scrollPosition = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event([
    { nativeEvent: { contentOffset: { y: scrollPosition } } },
  ]);

  const keyExtractor = (_item: any, index: number) => {
    return index.toString();
  };

  const refresh: React.ReactElement<RefreshControlProps> = (
    <RefreshControl
      refreshing={isLoading}
      onRefresh={onRefresh}
      colors={[colors.orangeUI]}
    />
  ) as React.ReactElement<RefreshControlProps>;

  const sections = [];

  sections.push({
    data: [{}],
    renderItem: () => <SuggestionBox key={'SuggestionBox'} />,
  });

  sections.push({
    data: [{}],
    renderItem: () => <WalletBalance key={'WalletBalance'} />,
  });

  sections.push({
    data: [{}],
    renderItem: () => (
      <TransactionFeed data={fetchedTransactions} key={'RecentActivityFeed'} />
    ),
  });

  useEffect(() => {
    // generate walletBalance with Bdk to be passed on to WalletBalance component
    syncWallet();
    getBdkWalletBalance();
    getBdkTransactions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WalletHeader />
      <AnimatedSectionList
        scrollEventThrottle={16}
        onScroll={onScroll}
        refreshControl={refresh}
        onRefresh={onRefresh}
        refreshing={isLoading}
        style={styles.container}
        sections={sections}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>
  );
};

WalletHome.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    margin: variables.contentPadding,
  },
  sectionHeader: {
    ...fontStyles.sectionHeader,
    color: colors.gray4,
    paddingRight: 5,
    marginTop: 20,
  },
});

export default WalletHome;
