import React, { useEffect, useLayoutEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
import { maskString } from '../utils/helpers';
import {
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import useContactsBottomSheet from '../components/useContactsBottomSheet';
import store from '../state/store';
import { useStoreState } from '../state/hooks';
import { SettingsItemWithTextValue } from '../components/InfoListItem';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { processInputData } from '../utils/lightning/decode';
import { showErrorBanner } from '../utils/alerts';

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
  const routedContact = route.params.contact!;
  const allContacts = useStoreState((state) => state.lightning.contacts);
  const payments = useStoreState((state) => state.lightning.payments);
  const contact = allContacts.filter((c) => c.id === routedContact.id)[0];
  const transactions = Object.values(payments).filter(
    (transaction) => transaction.contact?.id === contact.id
  );
  const [newAvatarUri, setNewAvatarUri] = useState(contact?.avatarUri);
  const [currentAddresses, setCurrentAddresses] = useState<TIdentifier[]>([]);
  const [isValidating, setIsValidating] = useState(null);

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

  const onAvatarChosen = async (avatarDataUrl: string | null) => {
    if (!avatarDataUrl) {
      setNewAvatarUri(null);
    } else {
      try {
        const newAvatarPath = await saveContactAvatar(avatarDataUrl, contact.id);
        setNewAvatarUri(newAvatarPath);
        const payload: TContact = {
          id: contact.id,
          avatarUri: newAvatarPath,
        };
        store.dispatch.lightning.updateContact({
          contactId: contact.id,
          updatedContact: payload,
        });
      } catch (error) {
        console.log(error.message || "Avatar wasn't uploaded right");
      }
    }
  };

  useEffect(() => {
    const allAddresses: TIdentifier[] = contact.identifiers!;
    setCurrentAddresses(allAddresses);
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

  const onPressIdentifier = async (identifier) => {
    setIsValidating(identifier);
    const result = await processInputData({
      data: identifier,
      showErrors: true,
    });

    if (result.isOk()) {
      setIsValidating(null);
    }

    if (result.isErr()) {
      showErrorBanner({
        title: 'Invalid input',
        message: "Can't process this address. Please verify that it's valid",
      });
      setIsValidating(null);
    }
  };

  const IdentifiersList = ({ addresses }) => (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {addresses.map((identifier: TIdentifier, index) => (
        <TouchableWithoutFeedback key={index} onPress={() => onPressIdentifier(identifier.address)}>
          <View style={styles.addressRow}>
            <View>
              <FormLabel style={styles.identifierLabel}>{identifier.label}</FormLabel>
              <Text style={styles.identifier}>{formatAddress(identifier.address)}</Text>
            </View>
            <View style={styles.row}>
              {isValidating === identifier.address && (
                <ActivityIndicator
                  size="small"
                  color={Colors.orange.base}
                  style={{ paddingRight: 5 }}
                />
              )}
              <View style={styles.sendIconContainer}>
                <Icon name="icon-arrow-up" style={styles.icon} />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      ))}
    </ScrollView>
  );

  const onPressActivity = () => {
    cueInformativeHaptic();
    // cue user's activity screen;
    console.log('has pressed activity item');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.profileContainer}>
        <AvatarPicker
          avatar={newAvatarUri || null}
          onImageChosen={onAvatarChosen}
          contact={contact}
        />
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
            disabled={true}
          />
        </View>
      </View>
      <View style={styles.activityContainer}>
        <SectionTitle title="Activity" style={styles.sectionHeader} />
        {!!transactions && transactions.length > 0 ? (
          <SettingsItemWithTextValue
            title={`${transactions.length} transactions`}
            withChevron={true}
            onPress={onPressActivity}
          />
        ) : (
          <Text style={styles.emptyText}>No activity at this time</Text>
        )}
      </View>
      <View style={styles.addressContainer}>
        {!!currentAddresses && currentAddresses.length > 0 ? (
          <>
            <SectionTitle title="Addresses" style={styles.sectionHeader} />
            <IdentifiersList addresses={currentAddresses} />
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
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    width: 30,
    height: 30,
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
    color: Colors.neutrals.light.neutral8,
    ...TypographyPresets.Body5,
  },
  emptyCta: {
    justifyContent: 'flex-start',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});

export default ContactDetailScreen;
