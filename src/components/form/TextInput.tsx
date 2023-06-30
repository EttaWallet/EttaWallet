import React from 'react';
import { StyleSheet, View } from 'react-native';
import TextInput, { TextInputProps } from '../TextInput';
import { Colors } from 'etta-ui';

export type Props = TextInputProps;

export default function FormTextInput({ style, inputStyle, ...passThroughProps }: Props) {
  return (
    <View style={[style, styles.textInput]}>
      <TextInput
        inputStyle={inputStyle}
        placeholderTextColor={Colors.neutrals.light.neutral7}
        underlineColorAndroid="transparent"
        {...passThroughProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    paddingHorizontal: 12,
    marginTop: 16,
    justifyContent: 'flex-end',
    borderColor: Colors.neutrals.light.neutral3,
    borderRadius: 4,
    borderWidth: 1.5,
    color: Colors.common.black,
    width: '100%',
  },
});
