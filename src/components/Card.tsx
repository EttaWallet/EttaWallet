import { Colors } from 'etta-ui';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export interface Props extends ViewProps {
  rounded?: boolean;
  shadow?: boolean;
  children?: React.ReactNode;
}

const Card = ({ style, rounded = false, shadow = true, ...props }: Props) => {
  return (
    <View
      style={[
        styles.container,
        rounded && styles.rounded,
        shadow ? styles.shadow : undefined,
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutrals.light.neutral1,
    padding: 16,
  },
  rounded: {
    borderRadius: 8,
  },
  shadow: {
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    shadowColor: Colors.neutrals.light.neutral5,
  },
});

export default Card;
