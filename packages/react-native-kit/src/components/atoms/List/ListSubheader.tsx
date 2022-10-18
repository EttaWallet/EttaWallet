import * as React from 'react';
import { StyleSheet, StyleProp, TextStyle } from 'react-native';
import color from 'color';
import { Text, ThemeProp } from '@ettawallet/react-core';
import { useTheme } from '@emotion/react';

export type ListSubheaderProps = React.ComponentProps<typeof Text> & {
  /**
   * @optional
   */
  theme?: ThemeProp;
  /**
   * Style that is passed to Text element.
   */
  style?: StyleProp<TextStyle>;
};

/**
 * A component used to display a header in lists.
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { List } from '@ettawallet/react-native-kit';
 *
 * const MyComponent = () => <ListSubheader>My List Title</ListSubheader>;
 *
 * export default MyComponent;
 * ```
 */
const ListSubheader = ({ style, ...rest }: ListSubheaderProps) => {
  const theme = useTheme() as ThemeProp;

  const textColor = '#000000';

  return (
    <Text
      numberOfLines={1}
      {...rest}
      style={[
        styles.container,
        {
          color: textColor,
          //   ...(theme.isV3 ? theme.typescale.bodyMedium : theme.fonts.medium),
        },
        style,
      ]}
    />
  );
};

ListSubheader.displayName = 'List.Subheader';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
});

export default ListSubheader;
