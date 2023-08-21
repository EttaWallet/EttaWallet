import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Icon } from 'etta-ui';
import { navigate } from '../NavigationService';
import { useTranslation } from 'react-i18next';
import type { StackParamList } from '../types';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { pressableHitSlop } from '../../utils/helpers';

type NavProps =
  | {
      nextScreen: keyof StackParamList;
      onSkip?: () => void;
    }
  | {
      nextScreen?: keyof StackParamList;
      onSkip: () => void;
    };

const SkipButton = ({ onSkip, nextScreen }: NavProps) => {
  const { t } = useTranslation();

  const onPressSkip = () => {
    if (onSkip) {
      onSkip();
    }
    if (nextScreen) {
      navigate(nextScreen);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPressSkip}
      style={styles.container}
      hitSlop={pressableHitSlop}
    >
      <Text style={styles.text}>{t('navigationLabels.skip')}</Text>
      <View style={styles.iconContainer}>
        <Icon name="icon-caret-right" style={styles.icon} />
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
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.black,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 18,
    lineHeight: 18,
  },
});

export default SkipButton;
