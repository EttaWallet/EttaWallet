/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native-gesture-handler';
import { pressableHitSlop, sortContacts } from '../utils/helpers';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import useContactsBottomSheet from '../components/useContactsBottomSheet';
import { useTranslation } from 'react-i18next';
import { TContact } from '../utils/types';
import { useStoreState } from '../state/hooks';
import { SearchInput } from '../components/SearchInput';
import ContactItem from '../components/ContactItem';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import { getLightningStore } from '../utils/lightning/helpers';

const ContactsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { openNewContactSheet, NewContactBottomSheet } = useContactsBottomSheet({});
  const [searchQuery, setSearchQuery] = useState('');
  const [allContacts, setAllContacts] = useState<TContact[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const onToggleKeyboard = (visible: boolean) => {
    setKeyboardVisible(visible);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Contacts" />,
      headerRight: () => <AddContactButton />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const AddContactButton = () => {
    return (
      <TouchableOpacity onPress={openNewContactSheet} hitSlop={pressableHitSlop}>
        <View style={styles.addIconContainer}>
          <Icon name="icon-plus" style={styles.addIcon} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = useCallback(
    ({ item: contact }: { item: TContact }) => <ContactItem contact={contact} />,
    []
  );

  const keyExtractor = (item: TContact) => item.id;

  const filteredContacts = React.useMemo(() => {
    if (!searchQuery) {
      return allContacts;
    }

    const filtered = allContacts.filter((contact) =>
      contact.alias?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered;
  }, [allContacts, searchQuery]);

  const renderItemSeparator = () => <View style={styles.separator} />;

  const renderNoContactsView = () => (
    <View style={styles.emptyView}>
      {searchQuery !== '' ? (
        <Text style={styles.emptyText}>{`No results found for ${searchQuery}`}</Text>
      ) : (
        <>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.purple.base,
              },
            ]}
          >
            <Icon name="icon-contacts-2" style={styles.icon} />
          </View>
          <Text style={styles.emptyTitle}>Add your first contact</Text>
          <Text style={styles.emptyText}>
            Send and receive more easily, and keep your payments well organized.
          </Text>
          <View style={styles.btnContainer}>
            <Button title="Add contact" style={styles.button} onPress={openNewContactSheet} />
          </View>
        </>
      )}
    </View>
  );

  const handleContactsRefresh = useCallback(() => {
    refreshContacts();
  }, []);

  return (
    <SafeAreaView style={styles.body} edges={['bottom']}>
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <>
            {allContacts.length > 0 ? (
              <SearchInput
                placeholder="Search ..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBox}
              />
            ) : null}
            <FlatList
              contentContainerStyle={[
                styles.content,
                !isKeyboardVisible &&
                  insets && {
                    paddingBottom: insets.bottom,
                  },
              ]}
              keyboardShouldPersistTaps={'always'}
              ListEmptyComponent={renderNoContactsView()}
              ItemSeparatorComponent={renderItemSeparator}
              data={filteredContacts}
              renderItem={renderItem}
              initialNumToRender={30}
              keyExtractor={keyExtractor}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleContactsRefresh}
                  tintColor={Colors.orange.base}
                />
              }
            />
          </>
        )}
      </SafeAreaInsetsContext.Consumer>
      <KeyboardSpacer onToggle={onToggleKeyboard} />
      {NewContactBottomSheet}
    </SafeAreaView>
  );
};

ContactsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  alias: { ...TypographyPresets.Body3, color: Colors.common.black },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    margin: 'auto',
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  textInput: {
    paddingHorizontal: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    borderColor: Colors.neutrals.light.neutral3,
    borderRadius: 4,
    borderWidth: 1.5,
    color: Colors.common.black,
    maxHeight: 50,
    width: '100%',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral4,
  },
  emptyStateBody: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral4,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyView: {
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  emptyTitle: {
    ...TypographyPresets.Header5,
    textAlign: 'center',
    paddingBottom: 10,
  },
  emptyText: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    textAlign: 'center',
  },
  icon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 30,
    color: Colors.common.white,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 20,
  },
  addIconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
  },
  addIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    color: Colors.common.black,
  },
  btnContainer: {
    marginTop: 24,
  },
  button: {
    justifyContent: 'center',
  },
  searchBox: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
});

export default ContactsScreen;
