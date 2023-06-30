import React from 'react';
import { View } from 'react-native';
import { Icon } from 'etta-ui';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { pressableHitSlop } from '../../utils/helpers';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';
import { navigate } from '../NavigationService';
import { Screens } from '../Screens';

const ContactsButton = () => {
  const onPressBtn = () => {
    cueInformativeHaptic();
    navigate(Screens.ContactsScreen);
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TouchableOpacity onPress={onPressBtn} hitSlop={pressableHitSlop}>
        <Icon name="icon-address-book-2" style={{ paddingRight: 8, fontSize: 32 }} />
      </TouchableOpacity>
    </View>
  );
};

export default ContactsButton;
