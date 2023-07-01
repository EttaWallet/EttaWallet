import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TContact } from '../utils/types';
import ContactAvatar from './ContactAvatar';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import { TouchableOpacity } from '@gorhom/bottom-sheet';

interface Props {
  contact: TContact;
  isSelected: boolean;
  onSelect: (contact: TContact) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SelectContactItem = ({ contact, isSelected, onSelect }: Props) => {
  const onPress = () => {
    onSelect(contact);
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.row}>
        <ContactAvatar style={styles.avatar} contact={contact} />
        <View style={styles.contentContainer}>
          <Text numberOfLines={1} ellipsizeMode={'tail'} style={styles.alias}>
            {contact?.alias}
          </Text>
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
    paddingHorizontal: 16,
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
});

export default SelectContactItem;
