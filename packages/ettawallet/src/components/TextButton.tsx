/**
 * A button that's just text. For ann underlined text link, see Link.tsx
 */

import * as React from 'react';
import { StyleSheet } from 'react-native';
import BorderlessButton, { Props } from './BorderlessButton';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

const TextButton = ({ style, ...passThroughProps }: Props) => {
  return (
    <BorderlessButton
      {...passThroughProps}
      style={style ? [styles.text, style] : styles.text}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    ...fontStyles.regular600,
    color: colors.greenUI,
  },
});

export default TextButton;
