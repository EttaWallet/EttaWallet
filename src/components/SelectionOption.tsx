import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TypographyPresets, Colors } from 'etta-ui';
import RadioButton from '../icons/RadioButton';

interface Props {
  text: string;
  isSelected: boolean;
  onSelect: (word: string, data: any) => void;
  hideCheckboxes?: boolean;
  data?: any;
}

const SelectionOption = ({ text, isSelected, data, onSelect, hideCheckboxes }: Props) => {
  const onPress = () => {
    onSelect(text, data);
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.contentContainer}>
        {!hideCheckboxes && (
          <View style={styles.iconContainer}>
            <RadioButton selected={isSelected} />
          </View>
        )}
        <Text style={styles.text} numberOfLines={1}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: Colors.neutrals.light.neutral4,
  },
  text: {
    ...TypographyPresets.Body4,
    flex: 1,
    color: Colors.common.black,
    marginRight: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
});

export default SelectionOption;
