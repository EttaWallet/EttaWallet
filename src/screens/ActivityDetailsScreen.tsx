/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { headerWithBackButton } from '../navigation/Headers';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { moderateScale } from '../utils/sizing';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { InfoListItem } from '../components/InfoListItem';
import { humanizeTimestamp } from '../utils/time';
import i18n from '../i18n';
import AmountDisplay from '../components/amount/AmountDisplay';
import store from '../state/store';
import { getLightningStore } from '../utils/lightning/helpers';
import useContactsBottomSheet from '../components/useContactsBottomSheet';
import { EPaymentType, TContact } from '../utils/types';
import ContactItem from '../components/ContactItem';
import DetailedActivityDrawer from '../components/DetailedActivityDrawer';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { BottomSheetSearchInput } from '../components/SearchInput';
import { sortContacts } from '../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import FormLabel from '../components/form/Label';
import { useStoreState } from '../state/hooks';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ActivityDetailsScreen>;
type Props = RouteProps;

const ActivityDetailsScreen = ({ route }: Props) => {
  const { transaction } = route.params;
  const storedPayments = useStoreState((state) => state.lightning.payments);
  // get transaction in question from payments object in lightning store
  const payment = storedPayments.filter((p) => p.payment_hash === transaction.payment_hash)[0];
  const [userNote, setUserNote] = useState(payment?.note || '');
  const [selectedContact, setSelectedContact] = useState<TContact>(payment?.contact!);

  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [allContacts, setAllContacts] = useState<TContact[]>([]);

  const { NewContactBottomSheet, openNewContactSheet } = useContactsBottomSheet({});

  const pickContactBottomSheetRef = useRef<BottomSheet>(null);

  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const pickContactSnapPoints = useMemo(() => ['40%', '75%'], []);
  const { animatedHandleHeight, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(pickContactSnapPoints);

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.1} />
    ),
    []
  );

  const onBlur = () => {
    const trimmedComment = userNote?.trim();
    setUserNote(trimmedComment);
  };

  const ActivitySeparator = () => <View style={styles.separator} />;

  useEffect(() => {
    // update payment note if changed by user
    store.dispatch.lightning.updatePayment({
      payment_hash: transaction.payment_hash!,
      updates: {
        type: transaction.type,
        note: userNote,
      },
    });
  }, [userNote]);

  useEffect(() => {
    // update payment note if changed by user
    store.dispatch.lightning.updatePayment({
      payment_hash: transaction.payment_hash!,
      updates: {
        type: transaction.type,
        contact: selectedContact,
      },
    });
  }, [selectedContact]);

  function onSelect(contact: TContact) {
    cueInformativeHaptic();
    // updatePayment store
    setSelectedContact(contact);
    pickContactBottomSheetRef.current?.close();
  }

  const renderItem = useCallback(
    ({ item: contact }: { item: TContact }) => (
      <ContactItem contact={contact} onSelect={onSelect} isSelected={false} />
    ),
    []
  );

  const renderItemSeparator = () => <View style={styles.separator} />;

  const keyExtractor = (item: TContact) => item.id;

  const filteredContacts = useMemo(() => {
    if (!searchText) {
      return allContacts;
    }

    const filtered = allContacts.filter((contact) =>
      contact.alias?.toLowerCase().includes(searchText.toLowerCase())
    );

    return filtered;
  }, [allContacts, searchText]);

  const refreshContacts = () => {
    setRefreshing(true);
    const contacts = getLightningStore().contacts;
    const sortedContacts = sortContacts(contacts);
    setAllContacts(sortedContacts);
    setRefreshing(false);
    return;
  };

  useEffect(() => {
    // get current contacts
    refreshContacts();
    console.log('refreshed contact list');
  }, []);

  const handleContactsRefresh = useCallback(() => {
    refreshContacts();
    console.log('refreshing contacts in bottomsheet');
  }, []);

  const openPickContactSheet = () => {
    cueInformativeHaptic();
    pickContactBottomSheetRef.current?.snapToIndex(0);
  };

  const PickContactBottomSheet = useMemo(() => {
    const NoContactsView = () => (
      <View style={styles.emptyView}>
        {searchText !== '' ? (
          <Text style={styles.emptyText}>{`No results found for ${searchText} `}</Text>
        ) : (
          <>
            <Text style={styles.emptyTitle}>Add your first contact</Text>
            <Text style={styles.emptyText}>
              Send and receive more easily, and keep your payments well organized.
            </Text>
            <View style={styles.emptyBtnContainer}>
              <Button title="Add contact" style={styles.emptyBtn} onPress={openNewContactSheet} />
            </View>
          </>
        )}
      </View>
    );

    return (
      <BottomSheet
        ref={pickContactBottomSheetRef}
        index={-1}
        snapPoints={pickContactSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View
          style={[styles.bottomSheetContainer, { paddingBottom }]}
          onLayout={handleContentLayout}
        >
          <View style={styles.pickContactContainer}>
            <Text style={styles.bottomSheetTitle}>Pick a contact</Text>
            <Icon name="icon-plus" onPress={openNewContactSheet} style={styles.addIcon} />
          </View>
          <BottomSheetSearchInput
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchBox}
          />
          <BottomSheetFlatList
            data={filteredContacts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={{ backgroundColor: Colors.common.white }}
            ItemSeparatorComponent={renderItemSeparator}
            ListEmptyComponent={NoContactsView}
            refreshing={refreshing}
            onRefresh={handleContactsRefresh}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </BottomSheet>
    );
  }, [
    pickContactSnapPoints,
    animatedHandleHeight,
    animatedContentHeight,
    renderBackdrop,
    paddingBottom,
    handleContentLayout,
    openNewContactSheet,
    searchText,
    filteredContacts,
    renderItem,
    handleContactsRefresh,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.text}>You {transaction.type}</Text>
        <ScrollView>
          <AmountDisplay
            inputAmount={transaction.amount_sat?.toString()!}
            usingLocalCurrency={false}
            paymentType={transaction.type}
          />
        </ScrollView>
      </View>
      <View>
        {selectedContact ? (
          <>
            <ContactItem
              contact={selectedContact}
              prefix={transaction.type === EPaymentType.received ? 'Received from' : 'Sent to'}
              onSelect={openPickContactSheet}
            />
            <ActivitySeparator />
          </>
        ) : (
          <InfoListItem
            title="Link to contact"
            value="Choose"
            onPress={openPickContactSheet}
            highlightValue={true}
          />
        )}
        <FormLabel style={styles.memoLabel}>Memo</FormLabel>
        <TextInput
          style={styles.inputContainer}
          autoFocus={false}
          multiline={true}
          numberOfLines={3}
          maxLength={140}
          onChangeText={setUserNote}
          value={userNote}
          placeholder="Write a short memo"
          placeholderTextColor={Colors.neutrals.light.neutral6}
          returnKeyType={'done'}
          onBlur={onBlur}
          blurOnSubmit={true}
        />
        {transaction.type === EPaymentType.sent ? (
          <InfoListItem
            title="Fees paid"
            value={`${transaction.fee_paid_sat}`}
            valueIsNumeric={true}
          />
        ) : null}
        <InfoListItem title="When" value={humanizeTimestamp(transaction.unix_timestamp!, i18n)} />
        <DetailedActivityDrawer transaction={transaction} />
      </View>
      {PickContactBottomSheet}
      {NewContactBottomSheet}
    </SafeAreaView>
  );
};

ActivityDetailsScreen.navigationOptions = {
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
  header: {
    paddingVertical: 16,
    justifyContent: 'center',
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
  inputContainer: {
    height: 60,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
    ...TypographyPresets.Body4,
    color: Colors.common.black,
    paddingTop: 8,
    marginLeft: 3,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btn: {
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral4,
  },
  memoLabel: {
    paddingTop: 10,
    color: Colors.common.black,
    ...TypographyPresets.Body4,
    paddingLeft: 3,
  },
  emptyView: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  emptyTitle: {
    ...TypographyPresets.Header5,
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  emptyText: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    textAlign: 'center',
  },
  emptyBtnContainer: {
    marginVertical: 10,
  },
  emptyBtn: {
    justifyContent: 'center',
  },
  addIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: Colors.common.black,
  },
  pickContactContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handle: {
    backgroundColor: Colors.neutrals.light.neutral6,
  },
  bottomSheetContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  bottomSheetTitle: {
    ...TypographyPresets.Header5,
    textAlign: 'left',
  },
  searchBox: {
    marginVertical: 10,
  },
});

export default ActivityDetailsScreen;
