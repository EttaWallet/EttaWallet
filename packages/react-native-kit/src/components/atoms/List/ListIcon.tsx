import * as React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { Icon, IconProps } from '@ettawallet/react-core';

export type ListIconProps = {
  /**
   * Icon to show.
   */
  icon: string;
  /**
   * Color for the icon.
   */
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A component to show an icon in a list item.
 *
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { List } from '@ettawallet/react-native-kit';
 *
 * const MyComponent = () => (
 *   <>
 *     <ListIcon color="" icon="icon-bitcoin-circle" />
 *   </>
 * );
 *
 * export default MyComponent;
 * ```
 */
const ListIcon = ({ icon, style }: ListIconProps) => (
  <View style={[styles.item, style]} pointerEvents="box-none">
    <Icon name={icon} size="kilo" />
  </View>
);

const styles = StyleSheet.create({
  item: {
    margin: 8,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

ListIcon.displayName = 'List.Icon';

export default ListIcon;
