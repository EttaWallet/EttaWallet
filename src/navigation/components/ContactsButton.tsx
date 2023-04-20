import React from 'react';
import { View } from 'react-native';
import { Icon } from 'etta-ui';

const ContactsButton = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="icon-address-book-2" style={{ paddingRight: 8, fontSize: 30 }} />
    </View>
  );
};

export default ContactsButton;
