import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { pushToStack } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { Chip } from 'etta-ui';

export default function AccessibilityButton() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<StackParamList, keyof StackParamList>>();
  // @todo: should pull up accessibility options screen. LanguageModal is just a placeholder
  const onPress = () => pushToStack(Screens.LanguageModal, { nextScreen: route.name });

  return (
    <Chip onPress={onPress} icon="icon-edit" iconPosition="left">
      {t('accessibility')}
    </Chip>
  );
}
