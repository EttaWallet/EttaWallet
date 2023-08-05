import React, { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  StyleSheet,
  View,
  Platform,
  Text,
  SectionList,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  RefreshControlProps,
} from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { Colors, TypographyPresets } from 'etta-ui';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { groupActivityInSections } from '../utils/lightning/helpers';
import { TLightningPayment } from '../utils/types';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sortTxs } from '../utils/helpers';
import { RefreshControl } from 'react-native-gesture-handler';
import { useStoreState } from '../state/hooks';
import TransactionItem from '../components/TransactionItem';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ActivityScreen>;
type Props = RouteProps;

interface FeedHeaderProps {
  text: string;
  style?: StyleProp<ViewStyle>;
}

const FeedHeader = ({ text, style }: FeedHeaderProps) => {
  return (
    <View style={[styles.feedHeaderContainer, style]}>
      <Text style={styles.feedHeaderText}>{text}</Text>
    </View>
  );
};

const NoActivity = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.noActivityContainer} edges={['bottom']}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Nothing to see here yet</Text>
      </View>
      <Text style={styles.noActivityText}>{t('There are no transactions at this time.')}</Text>
    </SafeAreaView>
  );
};

const ActivityScreen = ({}: Props) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const paymentsStore = useStoreState((state) => state.lightning.payments);

  const transactions = sortTxs(Object.values(paymentsStore));

  const handleRefresh = () => {
    setIsRefreshing(true);
    // maybe do something?
    setIsRefreshing(false);
    return 0;
  };

  useEffect(() => {
    handleRefresh();
  }, [paymentsStore]);

  const sections = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    return groupActivityInSections(transactions);
  }, [transactions]);

  if (!transactions.length) {
    return <NoActivity />;
  }

  function renderItem({ item: tx }: { item: TLightningPayment; index: number }) {
    return (
      <>
        <TransactionItem payment={tx} />
        <View style={styles.separator} />
      </>
    );
  }

  const refresh: React.ReactElement<RefreshControlProps> = (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      colors={[Colors.orange.base]}
    />
  ) as React.ReactElement<RefreshControlProps>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>All Transactions</Text>
      </View>
      <>
        <SectionList
          renderItem={renderItem}
          renderSectionHeader={(item) => <FeedHeader text={item.section.title} />}
          //@ts-ignore TODO: check data object and types
          sections={sections}
          keyExtractor={(item) => `${item.payment_hash}`}
          keyboardShouldPersistTaps="always"
          onEndReached={handleRefresh}
          refreshControl={refresh}
          showsVerticalScrollIndicator={false}
        />
        {isRefreshing && (
          <View style={styles.centerContainer}>
            <ActivityIndicator style={styles.loadingIcon} size="large" color={Colors.orange.base} />
          </View>
        )}
      </>
    </SafeAreaView>
  );
};

ActivityScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 5,
  },
  title: {
    ...TypographyPresets.Header5,
    color: Colors.common.black,
    marginBottom: 10,
  },
  totalBalance: {
    ...TypographyPresets.Header1,
  },
  // Activity Feed
  loadingIcon: {
    marginVertical: 24,
    height: 108,
    width: 108,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  // Humanized time header
  feedHeaderContainer: {
    backgroundColor: Colors.common.white,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedHeaderText: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
  },
  // No  activity Component
  noActivityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  noActivityIcon: {
    marginVertical: 20,
    height: 108,
    width: 108,
  },
  noActivityText: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
    textAlign: 'center',
  },
  // Transaction item
  transactionContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  transactionContent: {
    paddingHorizontal: 10,
    flex: 1,
    flexGrow: 1,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
    flex: 0,
    maxWidth: '35%',
  },
  transactionTitle: {
    ...TypographyPresets.Body4,
    flexShrink: 1,
  },
  transactionSubtitle: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
  transactionAmount: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
    paddingTop: 2,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  fiatAmount: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral8,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  sentIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.blue.base,
  },
  receivedIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.green.base,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral4,
  },
});

export default ActivityScreen;
