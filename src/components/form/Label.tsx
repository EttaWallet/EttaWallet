import React from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors, TypographyPresets } from 'etta-ui';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { pressableHitSlop } from '../../utils/helpers';

interface Props {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  onPress?: () => void;
}

export default function FormLabel({ style, children, onPress }: Props) {
  return (
    <TouchableWithoutFeedback onPress={onPress} hitSlop={pressableHitSlop}>
      <Text style={[styles.container, style]}>{children}</Text>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
  },
});
