import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TContact } from '../utils/types';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import ContactAvatar from './ContactAvatar';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';

interface Props {
  contact: TContact;
}

const ContactItem = ({ contact }: Props) => {
  const onPress = () => {
    navigate(Screens.ContactDetailScreen, {
      contact: contact,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
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
    </TouchableWithoutFeedback>
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

export default memo(ContactItem);
