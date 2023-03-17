import { RouteProp, useRoute } from '@react-navigation/native';
import locales from '../i18n/locales';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { pushToStack } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { Chip } from 'etta-ui';

export default function LanguageButton() {
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<StackParamList, keyof StackParamList>>();
  const currentLanguage = locales[i18n.language];

  const onPress = () => pushToStack(Screens.LanguageModal, { nextScreen: route.name });

  return (
    <Chip onPress={onPress} selected icon="icon-ellipsis" iconPosition="left">
      {currentLanguage?.name ?? t('unknown')}
    </Chip>
  );
}
