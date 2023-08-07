import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Colors } from 'etta-ui';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

const ListItem = ({ children, onPress, disabled }: Props) => {
  return (
    <View style={styles.container}>
      {onPress ? (
        <TouchableWithoutFeedback onPress={onPress} disabled={disabled}>
          <View style={styles.innerView}>{children}</View>
        </TouchableWithoutFeedback>
      ) : (
        <View style={styles.innerView}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutrals.light.neutral1,
    marginVertical: 5,
    borderRadius: 5,
    justifyContent: 'center',
  },
  innerView: {
    padding: 12,
  },
});

export default ListItem;
