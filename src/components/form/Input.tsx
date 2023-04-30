import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import FormField from './Field';
import FormTextInput, { Props as FormTextInputProps } from './TextInput';

type Props = Omit<FormTextInputProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  label: string;
};

export default function FormInput({ style, label, ...passThroughProps }: Props) {
  return (
    <FormField label={label} style={style}>
      <FormTextInput {...passThroughProps} />
    </FormField>
  );
}
