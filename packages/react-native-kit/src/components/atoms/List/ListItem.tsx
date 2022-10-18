import * as React from 'react';
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import {
  TouchableRipple,
  Text,
  ThemeProp,
  EllipsizeProp,
  $RemoveChildren,
  FontWeightType,
} from '@ettawallet/react-core';
import { withTheme } from '@emotion/react';

type Title =
  | React.ReactNode
  | ((props: {
      selectable: boolean;
      ellipsizeMode: EllipsizeProp | undefined;
      color: string;
      fontSize: number;
      fontWeight: FontWeightType;
    }) => React.ReactNode);

type Description =
  | React.ReactNode
  | ((props: {
      selectable: boolean;
      ellipsizeMode: EllipsizeProp | undefined;
      color: string;
      fontSize?: number;
      fontWeight?: FontWeightType;
    }) => React.ReactNode);

export type ListItemProps = $RemoveChildren<typeof TouchableRipple> & {
  /**
   * Title text for the list item.
   */
  title: Title;
  /**
   * Description text for the list item or callback which returns a React element to display the description.
   */
  description?: Description;
  /**
   * Callback which returns a React element to display on the left side.
   */
  left?: (props: {
    color: string;
    style: {
      marginLeft: number;
      marginRight: number;
      marginVertical?: number;
    };
  }) => React.ReactNode;
  /**
   * Callback which returns a React element to display on the right side.
   */
  right?: (props: {
    color: string;
    style?: {
      marginRight: number;
      marginVertical?: number;
    };
  }) => React.ReactNode;
  /**
   * Function to execute on press.
   */
  onPress?: () => void;
  /**
   * @optional
   */
  theme: ThemeProp;
  /**
   * Style that is passed to the wrapping TouchableRipple element.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style that is passed to Title element.
   */
  titleStyle?: StyleProp<TextStyle>;
  /**
   * Style that is passed to Description element.
   */
  descriptionStyle?: StyleProp<TextStyle>;
  /**
   * Truncate Title text such that the total number of lines does not
   * exceed this number.
   */
  titleNumberOfLines?: number;
  /**
   * Truncate Description text such that the total number of lines does not
   * exceed this number.
   */
  descriptionNumberOfLines?: number;
  /**
   * Ellipsize Mode for the Title.  One of `'head'`, `'middle'`, `'tail'`, `'clip'`.
   *
   * See [`ellipsizeMode`](https://reactnative.dev/docs/text#ellipsizemode)
   */
  titleEllipsizeMode?: EllipsizeProp;
  /**
   * Ellipsize Mode for the Description.  One of `'head'`, `'middle'`, `'tail'`, `'clip'`.
   *
   * See [`ellipsizeMode`](https://reactnative.dev/docs/text#ellipsizemode)
   */
  descriptionEllipsizeMode?: EllipsizeProp;
};

/**
 * A component to show tiles inside a List.
 *
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { List } from '@ettawallet/react-native-kit';
 *
 * const MyComponent = () => (
 *   <ListItem
 *     title="First Item"
 *     description="Item description"
 *     left={props => <ListIcon {...props} icon="icon-block" />}
 *   />
 * );
 *
 * export default MyComponent;
 * ```
 *
 * @extends TouchableRipple
 */
const ListItem = ({
  left,
  right,
  title,
  description,
  onPress,
  style,
  titleStyle,
  titleNumberOfLines = 0,
  descriptionNumberOfLines = 0,
  titleEllipsizeMode,
  descriptionEllipsizeMode,
  descriptionStyle,
  ...rest
}: ListItemProps) => {
  const renderDescription = (
    descriptionColor: string,
    description?: Description | null
  ) => {
    return typeof description === 'function' ? (
      description({
        selectable: false,
        ellipsizeMode: descriptionEllipsizeMode,
        color: descriptionColor,
        fontSize: styles.description.fontSize,
        fontWeight: 'regular',
      })
    ) : (
      <Text
        numberOfLines={descriptionNumberOfLines}
        ellipsizeMode={descriptionEllipsizeMode}
        style={[
          styles.description,
          { color: descriptionColor },
          descriptionStyle,
        ]}
      >
        {description}
      </Text>
    );
  };

  const renderTitle = () => {
    const titleColor = '#000000';

    return typeof title === 'function' ? (
      title({
        selectable: false,
        ellipsizeMode: titleEllipsizeMode,
        color: titleColor,
        fontSize: styles.title.fontSize,
        fontWeight: 'bold',
      })
    ) : (
      <Text
        ellipsizeMode={titleEllipsizeMode}
        numberOfLines={titleNumberOfLines}
        style={[styles.title, { color: titleColor }, titleStyle]}
      >
        {title}
      </Text>
    );
  };

  const descriptionColor = '#48484a';

  return (
    <TouchableRipple
      {...rest}
      style={[styles.container, style]}
      onPress={onPress}
    >
      <View style={styles.row}>
        {left
          ? left({
              color: descriptionColor,
              style: description
                ? styles.iconMarginLeft
                : {
                    ...styles.iconMarginLeft,
                    ...styles.marginVerticalNone,
                  },
            })
          : null}
        <View style={[styles.item, styles.content]}>
          {renderTitle()}

          {description
            ? renderDescription(descriptionColor, description)
            : null}
        </View>
        {right
          ? right({
              color: descriptionColor,
              style: description
                ? styles.iconMarginRight
                : {
                    ...styles.iconMarginRight,
                    ...styles.marginVerticalNone,
                  },
            })
          : null}
      </View>
    </TouchableRipple>
  );
};

ListItem.displayName = 'List.Item';

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    textAlign: 'left',
    paddingRight: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    paddingRight: 0,
  },
  marginVerticalNone: { marginVertical: 0 },
  iconMarginLeft: { marginLeft: 0, marginRight: 16 },
  iconMarginRight: { marginRight: 0 },
  item: {
    marginVertical: 6,
    paddingLeft: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default withTheme(ListItem);
