/* eslint-disable react-native/no-inline-styles */
import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { getLightningStore, groupActivityInSections } from '../utils/lightning/helpers';
import { humanizeTimestamp } from '../utils/time';
import { TInvoice } from '@synonymdev/react-native-ldk';
import { EPaymentType, TLightningPayment } from '../utils/types';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { navigate } from '../navigation/NavigationService';
import { SafeAreaView } from 'react-native-safe-area-context';
import TransactionAmount from '../components/TransactionAmount';
import { sortTxs } from '../utils/helpers';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

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

interface NoActivityProps {
  loading: boolean;
  error: boolean | undefined;
}

const NoActivity = ({ loading, error }: NoActivityProps) => {
  const { t } = useTranslation();
  if (error) {
    return (
      <View style={styles.noActivityContainer}>
        <Text style={styles.noActivityText}>
          {t('Unable to load activity. Please try again later')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.noActivityContainer}>
      {loading && (
        <ActivityIndicator style={styles.noActivityIcon} size="large" color={Colors.orange.base} />
      )}
      <Text style={styles.noActivityText}>{t('There are no transactions at this time.')}</Text>
    </View>
  );
};

type TransactionItemProps = {
  invoice: TInvoice;
  type: EPaymentType;
  showFiat?: boolean;
  memo?: string;
};

const TransactionItem = ({ invoice, type, memo }: TransactionItemProps) => {
  const transactionSubText = memo ?? humanizeTimestamp(invoice.timestamp, i18n);
  return (
    <TouchableOpacity
      disabled={false}
      onPress={() => {
        cueInformativeHaptic();
        navigate(Screens.ActivityDetailsScreen, { transaction: { invoice: invoice, type: type } });
      }}
    >
      <View style={styles.transactionContainer}>
        {type === EPaymentType.sent ? (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(45, 156, 219, 0.1)' }]}>
            <Icon name="icon-arrow-up" style={styles.sentIcon} />
          </View>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
            <Icon name="icon-arrow-down" style={styles.receivedIcon} />
          </View>
        )}
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>{invoice.description}</Text>
          <Text style={styles.transactionSubtitle} numberOfLines={1}>
            {transactionSubText}
          </Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <TransactionAmount
            totalAmount={invoice.amount_satoshis!}
            usingLocalCurrency={false}
            transactionType={type}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ActivityScreen = ({}: Props) => {
  const [fetchingTransactions, setIsFetchingTransactions] = useState(false);

  const paymentsStore = getLightningStore().payments;
  const transactions = sortTxs(Object.values(paymentsStore));

  const sections = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    return groupActivityInSections(transactions);
  }, [transactions]);

  if (!transactions.length) {
    return <NoActivity loading={false} error={false} />;
  }

  function renderItem({ item: tx }: { item: TLightningPayment; index: number }) {
    return (
      <TransactionItem
        key={tx.invoice.payment_hash}
        invoice={tx.invoice}
        type={tx.type}
        memo={tx.note}
      />
    );
  }

  const fetchMoreActivity = () => {
    setIsFetchingTransactions(true);
    console.log('fetching transactions');
    setIsFetchingTransactions(false);
    return 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>All Transactions</Text>
      </View>
      <>
        <SectionList
          renderItem={renderItem}
          renderSectionHeader={(item) => <FeedHeader text={item.section.title} />}
          //@ts-ignore TODO: check data object and types
          sections={sections}
          keyExtractor={(item) =>
            `${item.invoice.payment_hash}-${item.invoice.timestamp.toString()}`
          }
          keyboardShouldPersistTaps="always"
          onEndReached={fetchMoreActivity}
        />
        {fetchingTransactions && (
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

const fontFamilyChoice = Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginVertical: 5,
  },
  title: {
    ...TypographyPresets.Header5,
    color: Colors.common.black,
    marginBottom: 10,
  },
  totalBalance: {
    ...TypographyPresets.Header1,
    fontFamily: fontFamilyChoice,
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
    paddingHorizontal: 16,
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
    paddingVertical: 12,
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
    paddingTop: 2,
  },
  transactionAmount: {
    ...TypographyPresets.Body4,
    fontFamily: fontFamilyChoice,
    color: Colors.common.black,
    paddingTop: 2,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  fiatAmount: {
    ...TypographyPresets.Body5,
    fontFamily: fontFamilyChoice,
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
});

export default ActivityScreen;
