/* eslint-disable react-native/no-inline-styles */
import React, { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  SafeAreaView,
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
import { moderateScale } from '../utils/sizing';
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
  error: Error | undefined;
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
      <Text style={styles.noActivityText}>{t('noTransactionActivity')} </Text>
    </View>
  );
};

type TransactionItemProps = {
  invoice: TInvoice;
  type: EPaymentType;
  showFiat?: boolean;
};

const TransactionItem = ({ invoice, type, showFiat }: TransactionItemProps) => {
  const fiatAmount = 1000000;
  const transactionDate = humanizeTimestamp(invoice.timestamp, i18n);
  return (
    <TouchableOpacity
      disabled={false}
      onPress={() =>
        navigate(Screens.ActivityDetailsScreen, { transaction: { invoice: invoice, type: type } })
      }
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
          <Text style={styles.transactionSubtitle}>{transactionDate}</Text>
        </View>
        <View
          style={[
            styles.transactionAmountContainer,
            !showFiat ? { justifyContent: 'center' } : null,
          ]}
        >
          <Text style={[styles.transactionAmount, { color: Colors.green.base }]}>
            +{invoice.amount_satoshis}
          </Text>
          {showFiat ? <Text style={styles.fiatAmount}>+{fiatAmount} UGX</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ActivityScreen = (props: Props) => {
  const [fetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(Error);

  const paymentsStore = getLightningStore().payments;
  const transactions = Object.values(paymentsStore);

  const sections = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    return groupActivityInSections(transactions);
  }, [transactions]);

  if (!transactions.length) {
    return <NoActivity loading={loading} error={error} />;
  }

  function renderItem({ item: tx }: { item: TLightningPayment; index: number }) {
    return <TransactionItem key={tx.invoice.payment_hash} invoice={tx.invoice} type={tx.type} />;
  }

  const fetchMoreActivity = () => {
    setIsFetchingTransactions(true);
    console.log('fetching transactions');
    setIsFetchingTransactions(false);
    return 0;
  };

  const totalBalance = transactions.reduce((total, transaction) => {
    const invoice: TInvoice = transaction.invoice;
    const satoshiAmount = invoice.amount_satoshis || 0;

    return total + satoshiAmount;
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.text}>Your balance in satoshi</Text>
        <Text style={styles.totalBalance}>{totalBalance}</Text>
      </View>
      <>
        <SectionList
          renderItem={renderItem}
          renderSectionHeader={(item) => <FeedHeader text={item.section.title} />}
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
    paddingHorizontal: 8,
  },
  headerContainer: {
    marginVertical: 32,
    alignItems: 'center',
  },
  text: {
    color: Colors.neutrals.light.neutral6,
    marginHorizontal: moderateScale(16),
    textAlign: 'center',
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
    paddingHorizontal: 16,
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
    marginTop: 32,
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
    paddingHorizontal: 16,
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
