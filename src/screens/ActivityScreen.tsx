/* eslint-disable react-native/no-inline-styles */
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
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { groupActivityInSections } from '../utils/lightning/helpers';
import { humanizeTimestamp } from '../utils/time';
import { TInvoice } from '@synonymdev/react-native-ldk';
import { EPaymentType, TContact, TLightningPayment } from '../utils/types';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { navigate } from '../navigation/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import TransactionAmount from '../components/TransactionAmount';
import { sortTxs } from '../utils/helpers';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import ContactAvatar from '../components/ContactAvatar';
import { RefreshControl } from 'react-native-gesture-handler';
import { useStoreState } from '../state/hooks';

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

type TransactionItemProps = {
  invoice: TInvoice;
  txType: EPaymentType;
  memo?: string;
  contact?: TContact;
  txTimestamp?: number;
};

const TransactionItem = ({ invoice, txType, memo, contact, txTimestamp }: TransactionItemProps) => {
  const transactionSubText = memo
    ? memo
    : humanizeTimestamp(txTimestamp || invoice.timestamp, i18n);
  return (
    <TouchableOpacity
      disabled={false}
      onPress={() => {
        cueInformativeHaptic();
        navigate(Screens.ActivityDetailsScreen, {
          transaction: { invoice: invoice, type: txType },
        });
      }}
    >
      <View style={styles.transactionContainer}>
        {contact ? (
          <ContactAvatar contact={contact} />
        ) : txType === EPaymentType.sent ? (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(45, 156, 219, 0.1)' }]}>
            <Icon name="icon-arrow-up" style={styles.sentIcon} />
          </View>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
            <Icon name="icon-arrow-down" style={styles.receivedIcon} />
          </View>
        )}
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>
            {contact ? contact.alias : invoice.description}
          </Text>
          <Text style={styles.transactionSubtitle} numberOfLines={1}>
            {transactionSubText}
          </Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <TransactionAmount
            totalAmount={invoice.amount_satoshis!}
            usingLocalCurrency={false}
            transactionType={txType}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ActivityScreen = ({}: Props) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const paymentsStore = useStoreState((state) => state.lightning.payments);

  const transactions = sortTxs(Object.values(paymentsStore));

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // update transactions list if payments object changes
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
        <TransactionItem
          key={tx.invoice.payment_hash}
          invoice={tx.invoice}
          txType={tx.type}
          memo={tx?.note}
          contact={tx?.contact}
          txTimestamp={tx?.timestamp}
        />
        <View style={styles.separator} />
      </>
    );
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    // maybe do something?
    setIsRefreshing(false);
    return 0;
  };

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
          keyExtractor={(item) => `${item.invoice.payment_hash}`}
          keyboardShouldPersistTaps="always"
          onEndReached={handleRefresh}
          refreshControl={refresh}
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
    alignSelf: 'flex-end',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral4,
  },
});

export default ActivityScreen;
