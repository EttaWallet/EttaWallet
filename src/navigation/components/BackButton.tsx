import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { Chip } from 'etta-ui';
import { navigateBack } from '../NavigationService';
import { useTranslation } from 'react-i18next';

interface Props {
  title?: string;
  onPressButton?: () => void;
}

const BackButton = ({ title, onPressButton }: Props) => {
  const { t } = useTranslation();

  const onPressBack = () => {
    navigateBack();
    if (onPressButton) {
      onPressButton?.();
    } else {
      navigateBack();
    }
  };

  // Prevent back button on Android
  useEffect(() => {
    const backPressListener = () => true;
    BackHandler.addEventListener('hardwareBackPress', backPressListener);
    return () => BackHandler.removeEventListener('hardwareBackPress', backPressListener);
  }, []);

  return (
    <View style={styles.container}>
      <Chip icon="icon-caret-left" onPress={onPressBack}>
        {title ? title : t('navigationLabels.back')}
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
