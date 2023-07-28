import React from 'react';
import { StyleSheet, View } from 'react-native';
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
    <View style={styles.iconContainer}>
      <TouchableOpacity onPress={onPressBtn} hitSlop={pressableHitSlop}>
        <Icon name="icon-address-book-2" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    paddingRight: 8,
    fontSize: 36,
  },
});

export default ContactsButton;
