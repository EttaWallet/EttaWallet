import * as React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import ListSubheader from './ListSubheader';
import { withTheme } from '@emotion/react';
import { ThemeProp } from '@ettawallet/react-core';

export type ListSectionProps = React.ComponentPropsWithRef<typeof View> & {
  /**
   * Title text for the section.
   */
  title?: string;
  /**
   * Content of the section.
   */
  children: React.ReactNode;
  /**
   * @optional
   */
  theme: ThemeProp;
  /**
   * Style that is passed to Title element.
   */
  titleStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

/**
 * A component used to group list items.
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { List } from '@ettawallet/react-native-kit';
 *
 * const MyComponent = () => (
 *   <ListSection>
 *     <ListSubheader>Some title</ListSubheader>
 *     <ListItem title="First Item" left={() => <ListIcon icon="icon-block" />} />
 *     <ListItem
 *       title="Second Item"
 *       left={() => <ListIcon color="" icon="icon-gear" />}
 *     />
 *   </ListSection>
 * );
 *
 * export default MyComponent;
 * ```
 */
const ListSection = ({
  children,
  title,
  titleStyle,
  style,
  ...rest
}: ListSectionProps) => (
  <View {...rest} style={[styles.container, style]}>
    {title ? <ListSubheader style={titleStyle}>{title}</ListSubheader> : null}
    {children}
  </View>
);

ListSection.displayName = 'List.Section';

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
});

export default withTheme(ListSection);
