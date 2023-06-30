/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useLayoutEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { pressableHitSlop } from '../utils/helpers';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import useContactsBottomSheet from '../components/useContactsBottomSheet';
import ContactsList from '../components/ContactsList';
import { useTranslation } from 'react-i18next';
import { TContact } from '../utils/types';
import { useStoreState } from '../state/hooks';

function nameCompare(a: TContact, b: TContact) {
  const nameA = a.alias?.toUpperCase() ?? '';
  const nameB = b.alias?.toUpperCase() ?? '';

  if (nameA > nameB) {
    return 1;
  } else if (nameA < nameB) {
    return -1;
  }
  return 0;
}

export function sortContacts(contacts: TContact[]) {
  return contacts.sort(nameCompare);
}

const ContactsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { openNewContactSheet, NewContactBottomSheet } = useContactsBottomSheet({});
  const allContacts = useStoreState((state) => state.lightning.contacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [allFiltered, setAllFiltered] = useState(() => sortContacts(allContacts));

  const AddContactButton = () => {
    return (
      <TouchableOpacity onPress={openNewContactSheet} hitSlop={pressableHitSlop}>
        <View style={styles.iconContainer}>
          <Icon name="icon-plus" style={styles.icon} />
        </View>
      </TouchableOpacity>
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Contacts" subTitle="Pick a contact" />,
      headerRight: () => <AddContactButton />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  interface Section {
    key: string;
    data: TContact[];
  }

  const buildSections = (): Section[] => {
    // add recent contacts to array
    const sections = [{ key: t('All contacts'), data: allFiltered }].filter(
      (section) => section.data.length > 0
    );

    return sections;
  };

  return (
    <SafeAreaView style={styles.body} edges={['top']}>
      <ContactsList sections={buildSections()} searchQuery={searchQuery} />
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
  iconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
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
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    color: Colors.common.black,
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
});

export default ContactsScreen;
