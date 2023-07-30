import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TContact } from '../utils/types';
import ContactAvatar from './ContactAvatar';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';

interface Props {
  contact: TContact;
  isSelected?: boolean;
  onSelect?: (contact: TContact) => void;
  prefix?: string;
  suffix?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ContactItem = ({ contact, isSelected, onSelect, prefix, suffix }: Props) => {
  const onPress = () => {
    if (onSelect) {
      onSelect(contact);
    } else {
      navigate(Screens.ContactDetailScreen, {
        contact: contact,
      });
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.row}>
        <ContactAvatar style={styles.avatar} contact={contact} />
        <View style={styles.contentContainer}>
          {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.alias}>
            {contact?.alias}
          </Text>
          {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        </View>
        <View style={styles.rightIconContainer}>
          <Icon name="icon-caret-right" style={styles.icon} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.black,
  },
  alias: { ...TypographyPresets.Body4, color: Colors.common.black },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefix: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
  suffix: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
});

export default ContactItem;
