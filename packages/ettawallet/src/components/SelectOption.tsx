import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Touchable from './Touchable';
import RadioButton from '../icons/RadioButton';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

interface Props {
  text: string;
  isSelected: boolean;
  onSelect: (word: string, data: any) => void;
  hideCheckboxes?: boolean;
  data?: any;
}

const SelectOption = ({
  text,
  isSelected,
  data,
  onSelect,
  hideCheckboxes,
}: Props) => {
  function onPress() {
    onSelect(text, data);
  }

  return (
    <Touchable onPress={onPress}>
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
    </Touchable>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.gray2,
  },
  text: {
    ...fontStyles.regular,
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
});

export default SelectOption;
