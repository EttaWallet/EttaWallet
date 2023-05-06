import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Icon } from 'etta-ui';
import { navigateBack } from '../NavigationService';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { pressableHitSlop } from '../../utils/helpers';

interface Props {
  onCancel?: () => void;
}

const CancelButton = ({ onCancel }: Props) => {
  const onPressCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigateBack();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={onPressCancel} hitSlop={pressableHitSlop}>
      <View style={styles.iconContainer}>
        <Icon name="icon-cross" style={styles.icon} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: Colors.neutrals.light.neutral3,
  },
  icon: {
    fontSize: 24,
    color: Colors.red.base,
  },
});

export default CancelButton;
