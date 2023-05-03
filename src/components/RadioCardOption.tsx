import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TypographyPresets, Colors } from 'etta-ui';
import RadioButton from '../icons/RadioButton';

interface Props {
  title: string;
  description?: string;
  isSelected: boolean;
  onSelect: (word: string, data: any) => void;
  hideRadio?: boolean;
  data?: any;
  disabled?: boolean;
}

const RadioCardOption = ({
  title,
  description,
  isSelected,
  data,
  onSelect,
  hideRadio,
  disabled,
}: Props) => {
  const onPress = () => {
    onSelect(title, data);
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={styles.contentContainer}>
        {!hideRadio && (
          <View style={styles.iconContainer}>
            <RadioButton selected={isSelected} disabled={disabled} />
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: Colors.neutrals.light.neutral1,
    padding: 16,
    borderRadius: 8,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    shadowColor: Colors.neutrals.light.neutral5,
    marginVertical: 5,
  },
  title: {
    ...TypographyPresets.Header5,
    color: Colors.common.black,
    paddingLeft: 5,
    lineHeight: 21,
  },
  description: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
  iconContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
});

export default RadioCardOption;
