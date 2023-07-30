import { RouteProp, useRoute } from '@react-navigation/native';
import locales from '../i18n/locales';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { pushToStack } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import HapticFeedback from 'react-native-haptic-feedback';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { pressableHitSlop } from '../utils/helpers';
import { StyleSheet, Text } from 'react-native';

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
    <TouchableWithoutFeedback onPress={onPress} style={styles.container} hitSlop={pressableHitSlop}>
      <Icon name="icon-globe" style={styles.icon} />
      <Text style={styles.text}>{currentLanguage ? currentLanguage?.name : t('unknown')}</Text>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 2,
    fontSize: 16,
  },
  text: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
  },
});
