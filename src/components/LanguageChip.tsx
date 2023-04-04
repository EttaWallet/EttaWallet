import { RouteProp, useRoute } from '@react-navigation/native';
import locales from '../i18n/locales';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { pushToStack } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { Chip } from 'etta-ui';
import HapticFeedback from 'react-native-haptic-feedback';

export default function LanguageChip() {
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<StackParamList, keyof StackParamList>>();
  const currentLanguage = locales[i18n.language];

  const onPress = () => {
    // Trigger haptic feedback
    HapticFeedback.trigger('impactHeavy');
    pushToStack(Screens.LanguageModal, { nextScreen: route.name });
  };

  return (
    <Chip onPress={onPress} icon="icon-globe" iconPosition="left">
      {currentLanguage?.name ?? t('unknown')}
    </Chip>
  );
}
