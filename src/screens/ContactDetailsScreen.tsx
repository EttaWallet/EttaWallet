import React, { useLayoutEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { saveContactAvatar } from '../utils/images';
import AvatarPicker from '../components/AvatarPicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import SectionTitle from '../components/SectionTitle';
import { TContact, TIdentifier } from '../utils/types';
import FormLabel from '../components/form/Label';
import { maskString, pressableHitSlop } from '../utils/helpers';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { getLightningStore } from '../utils/lightning/helpers';
import useContactsBottomSheet from '../components/useContactsBottomSheet';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ContactDetailScreen>;
type Props = RouteProps;

const compareAddressLabels = (a: TIdentifier, b: TIdentifier) => {
  const addressA = a.label?.toUpperCase() ?? '';
  const addressB = b.label?.toUpperCase() ?? '';

  if (addressA > addressB) {
    return 1;
  } else if (addressA < addressB) {
    return -1;
  }
  return 0;
};

export const sortAddresses = (identifiers: TIdentifier[]) => {
  return identifiers.sort(compareAddressLabels);
};

const ContactDetailScreen = ({ route, navigation }: Props) => {
  const contact = route.params.contact!;

  const {
    openAddAddressSheet,
    AddAddressBottomSheet,
    openContactMenuSheet,
    ContactMenuBottomSheet,
    EditContactBottomSheet,
  } = useContactsBottomSheet({
    contact: contact,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <TouchableOpacity onPress={openContactMenuSheet}>
            <Icon name="icon-ellipsis" style={styles.moreNavIcon} />
          </TouchableOpacity>
        </>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const [newAvatarUri, setNewAvatarUri] = useState(contact?.avatarUri || null);

  const onAvatarChosen = async (avatarDataUrl: string | null) => {
    if (!avatarDataUrl) {
      setNewAvatarUri(null);
    } else {
      try {
        const newAvatarPath = await saveContactAvatar(avatarDataUrl, contact.id);
        setNewAvatarUri(newAvatarPath);
      } catch (error) {
        console.log(error.message || "Avatar wasn't uploaded right");
      }
    }
  };

  const getCurrentIdentifiers = (currentContact: TContact) => {
    const allContacts = getLightningStore().contacts;
    const filtered = allContacts.filter((c) => c.id === currentContact.id);
    if (filtered.length > 0) {
      const currentAddresses: TIdentifier[] = filtered[0].identifiers!;
      return currentAddresses;
    }
    return [];
  };

  const currentIdentifiers = useMemo(() => {
    let currentList;
    currentList = getCurrentIdentifiers(contact);
    if (currentList !== undefined) {
      return sortAddresses(currentList);
    }
    return currentList;
  }, [contact]);

  /**
   * This method takes the address string from the identifier and masks
   * it if necessary. Useful if string too long to fit <Text>
   * @param address
   * @returns addresss
   */
  const formatAddress = (address: string) => {
    if (address.length > 20) {
      return maskString(address, 10);
    }
    return address;
  };

  const IdentifiersList = ({ identifiers }) => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {identifiers.map((identifier: TIdentifier, index) => (
        <View key={index} style={styles.addressRow}>
          <View style={styles.identifierContainer}>
            <FormLabel style={styles.identifierLabel}>{identifier.label}</FormLabel>
            <Text style={styles.identifier}>{formatAddress(identifier.address)}</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.sendIconContainer} hitSlop={pressableHitSlop}>
              <Icon name="icon-arrow-up" style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.profileContainer}>
        <AvatarPicker avatar={newAvatarUri} onImageChosen={onAvatarChosen} contact={contact} />
        <Text style={styles.alias}>{contact?.alias}</Text>
        <View style={styles.ctaContainer}>
          <Button
            title="Send"
            style={styles.button}
            onPress={() => 0}
            size="small"
            appearance="outline"
            icon="icon-arrow-up"
            iconPosition="left"
          />
          <Button
            title="Request"
            style={styles.button}
            onPress={() => 0}
            size="small"
            appearance="outline"
            icon="icon-arrow-down"
            iconPosition="left"
          />
        </View>
      </View>
      <View style={styles.activityContainer}>
        <SectionTitle title="Activity" style={styles.sectionHeader} />
        {/* @todo: Logic for activity section */}
        <Text style={styles.emptyText}>No activity at this time</Text>
      </View>
      <View style={styles.addressContainer}>
        {currentIdentifiers !== undefined ? (
          <>
            <SectionTitle title="Addresses" style={styles.sectionHeader} />
            <IdentifiersList identifiers={currentIdentifiers} />
          </>
        ) : (
          <>
            <SectionTitle title="Addresses" style={styles.sectionHeader} />
            <Text style={styles.emptyText}>You haven't added any addresses for this contact</Text>
            <Button
              size="small"
              title="Add"
              appearance="outline"
              icon="icon-plus"
              style={styles.emptyCta}
              onPress={openAddAddressSheet}
            />
          </>
        )}
      </View>
      {EditContactBottomSheet}
      {AddAddressBottomSheet}
      {ContactMenuBottomSheet}
    </SafeAreaView>
  );
};

ContactDetailScreen.navigationOptions = {
  ...headerWithBackButton,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  profileContainer: {
    paddingLeft: 10,
    paddingTop: 24,
    paddingRight: 15,
    paddingBottom: 37,
    flexDirection: 'column',
    alignItems: 'center',
  },
  activityContainer: {
    paddingVertical: 32,
  },
  addressContainer: {
    flex: 1,
  },
  alias: {
    ...TypographyPresets.Header5,
    marginVertical: 16,
  },
  ctaContainer: {
    flexDirection: 'row',
  },
  btnContainer: {
    marginBottom: 32,
  },
  button: {
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  sectionHeader: {
    borderBottomWidth: 0,
    borderBottomColor: Colors.neutrals.light.neutral4,
    paddingBottom: 5,
  },
  addressRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.light.neutral4,
    padding: 12,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  identifierContainer: {},
  identifier: {
    ...TypographyPresets.Body4,
  },
  identifierLabel: {
    color: Colors.neutrals.light.neutral7,
    ...TypographyPresets.Body5,
  },
  icon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: Colors.common.white,
  },
  sendIconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: Colors.blue.base,
  },
  moreNavIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 30,
    color: Colors.common.black,
  },
  emptyText: {
    color: Colors.neutrals.light.neutral7,
    ...TypographyPresets.Body5,
  },
  emptyCta: {
    justifyContent: 'flex-start',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});

export default ContactDetailScreen;
