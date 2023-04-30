import React from 'react';
import { View } from 'react-native';
import FormUnderline from './Underline';
import TextInput, { TextInputProps } from '../TextInput';
import { Colors } from 'etta-ui';

export type Props = TextInputProps;

export default function FormTextInput({ style, inputStyle, ...passThroughProps }: Props) {
  return (
    <View style={style}>
      <TextInput
        inputStyle={inputStyle}
        placeholderTextColor={Colors.neutrals.light.neutral7}
        underlineColorAndroid="transparent"
        {...passThroughProps}
      />
      <FormUnderline />
    </View>
  );
}
