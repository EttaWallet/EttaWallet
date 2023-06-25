import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, View, Platform, Text, ScrollView } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { Colors, TypographyPresets } from 'etta-ui';
import { moderateScale } from '../utils/sizing';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { InfoListItem } from '../components/InfoListItem';
import { humanizeTimestamp } from '../utils/time';
import i18n from '../i18n';
import AmountDisplay from '../components/amount/AmountDisplay';
import SectionTitle from '../components/SectionTitle';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ActivityDetailsScreen>;
type Props = RouteProps;

const ActivityDetailsScreen = ({ route }: Props) => {
  const { transaction } = route.params;
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.text}>You {transaction.type}</Text>
          <AmountDisplay
            inputAmount={transaction.invoice.amount_satoshis?.toString()!}
            usingLocalCurrency={false}
          />
        </View>
        <View>
          <SectionTitle title="Transaction details" style={styles.sectionHeader} />
          <InfoListItem
            title="When"
            value={humanizeTimestamp(transaction.invoice.timestamp, i18n)}
          />
          <InfoListItem
            title="Payment request"
            value={transaction.invoice.to_str}
            canCopy={true}
            maskValue={true}
          />
          <InfoListItem
            title="From node"
            value={transaction.invoice.payee_pub_key}
            valueIsNumeric={false}
            canCopy={true}
            maskValue={true}
          />
          <InfoListItem
            title="Payment hash"
            value={transaction.invoice.payment_hash}
            valueIsNumeric={false}
            canCopy={true}
            maskValue={true}
          />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

ActivityDetailsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const fontFamilyChoice = Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace';

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  text: {
    color: Colors.neutrals.light.neutral6,
    marginHorizontal: moderateScale(16),
    textAlign: 'center',
  },
  sectionHeader: {
    paddingTop: 20,
    paddingBottom: 10,
    borderTopWidth: 1,
  },
  total: {
    ...TypographyPresets.Header1,
    fontFamily: fontFamilyChoice,
  },
});

export default ActivityDetailsScreen;
