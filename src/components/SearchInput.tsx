import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Colors, Icon } from 'etta-ui';
import React from 'react';
import { StyleSheet, View, TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps;

export const SearchInput = ({ style, ...passThroughProps }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name="icon-search" style={styles.searchIcon} />
      </View>
      <TextInput
        {...passThroughProps}
        style={styles.input}
        placeholderTextColor={Colors.neutrals.light.neutral5}
        placeholder="Search ..."
      />
    </View>
  );
};

export const BottomSheetSearchInput = ({ style, ...passThroughProps }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name="icon-search" style={styles.searchIcon} />
      </View>
      <BottomSheetTextInput
        {...passThroughProps}
        style={styles.input}
        placeholderTextColor={Colors.neutrals.light.neutral5}
        placeholder="Search ..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 5,
    borderColor: Colors.neutrals.light.neutral5,
    borderWidth: 1,
    padding: 3,
    backgroundColor: Colors.neutrals.light.neutral3,
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    marginLeft: 5,
  },
  searchIcon: {
    fontSize: 20,
    color: Colors.neutrals.light.neutral5,
  },
  input: {
    paddingVertical: 6,
    color: Colors.common.black,
    flex: 1,
  },
});
