import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Chip } from 'etta-ui';
import { navigate } from '../NavigationService';
import { useTranslation } from 'react-i18next';
import type { StackParamList } from '../types';

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
    <SafeAreaView style={styles.container}>
      <Chip icon="icon-caret-right" iconPosition="right" onPress={onPressSkip}>
        {t('navigationLabels.skip')}
      </Chip>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 10,
  },
});

export default SkipButton;
