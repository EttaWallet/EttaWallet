import * as React from 'react';
import { StyleProp, StyleSheet, TextStyle } from 'react-native';
import { Cross } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import {
  TopBarIconButton,
  TopBarTextButton,
} from '../navigation/headers/TopBarButton';
import colors from '../styles/colors';

interface Props {
  navigation;
  onCancel?: () => void;
  style?: StyleProp<TextStyle>;
  buttonType?: 'text' | 'icon';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function CancelButton({
  onCancel,
  style,
  navigation,
  buttonType = 'text',
}: Props) {
  function onPressCancel() {
    if (onCancel) {
      onCancel();
    } else {
      navigation.goBack();
    }
  }

  return buttonType !== 'icon' ? (
    <TopBarTextButton
      onPress={onPressCancel}
      titleStyle={style ? [styles.title, style] : styles.title}
      title="Cancel"
    />
  ) : (
    <TopBarIconButton
      onPress={onPressCancel}
      icon={<Cross width={30} height={30} color="#000" />}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.dark,
  },
});
