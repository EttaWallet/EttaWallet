import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, View, Platform, Text, ScrollView } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { moderateScale } from '../utils/sizing';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { InfoListItem } from '../components/InfoListItem';
import { humanizeTimestamp } from '../utils/time';
import i18n from '../i18n';
import AmountDisplay from '../components/amount/AmountDisplay';
import { TextInput } from 'react-native-gesture-handler';
import store from '../state/store';
import { getLightningStore } from '../utils/lightning/helpers';
import useContactsBottomSheet from '../components/useContactsBottomSheet';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ActivityDetailsScreen>;
type Props = RouteProps;

const ActivityDetailsScreen = ({ route }: Props) => {
  const { transaction } = route.params;
  // get transaction in question from payments object in lightning store
  const payment = Object.values(getLightningStore().payments).filter(
    (p) => p.invoice.payment_hash === transaction.invoice.payment_hash
  )[0];
  const [userNote, setUserNote] = useState(payment.note!);

  const { openPickContactSheet, PickContactBottomSheet, NewContactBottomSheet } =
    useContactsBottomSheet({});

  const onBlur = () => {
    const trimmedComment = userNote?.trim();
    setUserNote(trimmedComment);
  };

  useEffect(() => {
    // update payment note if changed by user
    store.dispatch.lightning.updatePayment({
      invoice: transaction.invoice,
      type: transaction.type,
      note: userNote,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userNote]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.text}>You {transaction.type}</Text>
          <AmountDisplay
            inputAmount={transaction.invoice.amount_satoshis?.toString()!}
            usingLocalCurrency={false}
            receivedPayment={true}
          />
          <Button
            title="Link contact"
            onPress={openPickContactSheet}
            appearance="outline"
            size="small"
          />
        </View>
        <View>
          <TextInput
            style={styles.inputContainer}
            autoFocus={false}
            multiline={true}
            numberOfLines={5}
            maxLength={140}
            onChangeText={setUserNote}
            value={userNote}
            placeholder="✍️ Add a note"
            placeholderTextColor={Colors.orange.base}
            returnKeyType={'done'}
            onBlur={onBlur}
            blurOnSubmit={true}
          />
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
        {PickContactBottomSheet}
        {NewContactBottomSheet}
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
    paddingLeft: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.light.neutral4,
  },
  total: {
    ...TypographyPresets.Header1,
    fontFamily: fontFamilyChoice,
  },
  inputContainer: {
    height: 100,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
    ...TypographyPresets.Body4,
    marginLeft: 16,
    color: Colors.neutrals.light.neutral8,
  },
});

export default ActivityDetailsScreen;
