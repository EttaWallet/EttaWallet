import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  RefreshControl,
  RefreshControlProps,
  SectionList,
  StyleSheet,
  Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
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

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const WalletHome = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const { getBdkWalletBalance } = useContext(EttaStorageContext);

  const onRefresh = async () => {
    syncWallet();
    getBdkWalletBalance();
    getBdkPendingTransactions();
  };

  const getBdkPendingTransactions = async () => {
    try {
      const { data } = await BdkRn.getTransactions();
      console.info('all transactions', data);
    } catch (e) {
      console.log(e);
    }
  };

  const syncWallet = async () => {
    try {
      const { data } = await BdkRn.syncWallet();
      console.log(data); // sync status
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

  const RecentActivityFeed = () => {
    // Temporary component: will be replaced with actual activity feed.
    return (
      <Text style={styles.sectionHeader}>
        {t('walletHome.recentActivityHeader')}
      </Text>
    );
  };

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
    renderItem: () => <RecentActivityFeed key={'RecentActivityFeed'} />,
  });

  useEffect(() => {
    // generate walletBalance with Bdk to be passed on to WalletBalance component
    setTimeout(() => {
      getBdkWalletBalance();
    }, 1000);
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
