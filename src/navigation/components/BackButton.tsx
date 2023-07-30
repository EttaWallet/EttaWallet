import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Icon } from 'etta-ui';
import { navigateBack } from '../NavigationService';
import { useTranslation } from 'react-i18next';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { pressableHitSlop } from '../../utils/helpers';

interface Props {
  title?: string;
}

const BackButton = ({ title }: Props) => {
  const { t } = useTranslation();

  const onPressBack = () => {
    navigateBack();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPressBack}
      style={styles.container}
      hitSlop={pressableHitSlop}
    >
      <View style={styles.iconContainer}>
        <Icon name="icon-caret-left" style={styles.icon} />
      </View>
      {title ? <Text style={styles.text}>{title ? title : t('navigationLabels.back')}</Text> : null}
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
    justifyContent: 'center',
    fontSize: 24,
    color: Colors.common.black,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  text: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default BackButton;
