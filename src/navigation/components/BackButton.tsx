import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'etta-ui';
import { navigateBack } from '../NavigationService';
import { useTranslation } from 'react-i18next';

const BackButton = () => {
  const { t } = useTranslation();

  const onPressBack = () => {
    navigateBack();
  };

  return (
    <View style={styles.container}>
      <Chip icon="icon-caret-left" onPress={onPressBack}>
        {t('navigationLabels.back')}
      </Chip>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BackButton;
