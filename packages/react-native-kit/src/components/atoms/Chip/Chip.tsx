import * as React from 'react';
import {
  AccessibilityState,
  Animated,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {
  Icon,
  TouchableRipple,
  Text,
  EllipsizeProp,
  ThemeProp,
} from '@ettawallet/react-core';
import { useTheme } from '@emotion/react';
import Surface from '../Surface/Surface';
import { getChipColors } from './helpers';

export type ChipProps = React.ComponentProps<typeof Surface> & {
  /**
   * Mode of the chip.
   * - `flat` - flat chip without outline.
   * - `outlined` - chip with an outline.
   */
  mode?: 'flat' | 'outlined';
  /**
   * Text content of the `Chip`.
   */
  children: React.ReactNode;
  /**
   * Icon to display for the `Chip`. Both icon and avatar cannot be specified.
   */
  icon?: string;
  /**
   * Avatar to display for the `Chip`. Both icon and avatar cannot be specified.
   */
  avatar?: React.ReactNode;
  /**
   * Icon to display as the close button for the `Chip`. The icon appears only when the onClose prop is specified.
   */
  closeIcon?: string;
  /**
   * Whether chip is selected.
   */
  selected?: boolean;
  /**
   * Whether to style the chip color as selected.
   */
  selectedColor?: string;
  /**
   * Whether to display overlay on selected chip
   */
  showSelectedOverlay?: boolean;
  /**
   * Whether the chip is disabled. A disabled chip is greyed out and `onPress` is not called on touch.
   */
  disabled?: boolean;
  /**
   * Accessibility label for the chip. This is read by the screen reader when the user taps the chip.
   */
  accessibilityLabel?: string;
  /**
   * Accessibility label for the close icon. This is read by the screen reader when the user taps the close icon.
   */
  closeIconAccessibilityLabel?: string;
  /**
   * Function to execute on press.
   */
  onPress?: () => void;
  /**
   * Sets smaller horizontal paddings `12dp` around label, when there is only label.
   */
  compact?: boolean;
  /**
   * Whether chip should have the elevation.
   */
  elevated?: boolean;
  /**
   * Function to execute on long press.
   */
  onLongPress?: () => void;
  /**
   * Function to execute on close button press. The close button appears only when this prop is specified.
   */
  onClose?: () => void;
  /**
   * Style of chip's text
   */
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;

  /**
   * @optional
   */
  theme: ThemeProp;
  /**
   * Ellipsize Mode for the children text
   */
  ellipsizeMode?: EllipsizeProp;
};

/**
 * Chips can be used to display entities in small blocks.
 *
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Chip } from '@ettawallet/react-native-kit';
 *
 * const MyComponent = () => (
 *   <Chip icon="information" onPress={() => console.log('Pressed')}>Example Chip</Chip>
 * );
 *
 * export default MyComponent;
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Chip = ({
  mode = 'flat',
  children,
  icon,
  avatar,
  selected = false,
  disabled = false,
  accessibilityLabel,
  closeIconAccessibilityLabel = 'Close',
  onPress,
  onLongPress,
  onClose,
  closeIcon,
  textStyle,
  style,
  selectedColor,
  showSelectedOverlay = false,
  ellipsizeMode,
  compact,
  elevated = false,
  ...rest
}: ChipProps) => {
  const theme = useTheme() as ThemeProp;

  const { current: elevation } = React.useRef<Animated.Value>(
    new Animated.Value(elevated ? 1 : 0)
  );

  const isOutlined = mode === 'outlined';

  const handlePressIn = () => {
    const { scale } = theme.animation;
    Animated.timing(elevation, {
      toValue: theme ? (elevated ? 2 : 0) : 4,
      duration: 200 * scale,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    const { scale } = theme.animation;
    Animated.timing(elevation, {
      toValue: theme && elevated ? 1 : 0,
      duration: 150 * scale,
      useNativeDriver: true,
    }).start();
  };

  const opacity = 0.38;
  const defaultBorderRadius = 8;
  const iconSize = 'deca';

  const {
    backgroundColor: customBackgroundColor,
    borderRadius = defaultBorderRadius,
  } = (StyleSheet.flatten(style) || {}) as ViewStyle;

  const {
    borderColor,
    textColor,
    underlayColor,
    selectedBackgroundColor,
    backgroundColor,
  } = getChipColors({
    isOutlined,
    theme,
    selectedColor,
    showSelectedOverlay,
    customBackgroundColor,
    disabled,
  });

  const accessibilityState: AccessibilityState = {
    selected,
    disabled,
  };

  const elevationStyle = Platform.OS === 'android' ? elevation : 0;
  const multiplier = compact ? 1.5 : 2;
  const labelSpacings = {
    marginRight: onClose ? 0 : 8 * multiplier,
    marginLeft: avatar || icon || selected ? 4 * multiplier : 8 * multiplier,
  };
  const contentSpacings = {
    paddingRight: onClose ? 34 : 0,
  };

  return (
    <Surface
      style={
        [
          styles.container,
          isOutlined ? styles.md3OutlineContainer : styles.md3FlatContainer,
          {
            backgroundColor: selected
              ? selectedBackgroundColor
              : backgroundColor,
            borderColor,
            borderRadius,
          },
          style,
        ] as StyleProp<ViewStyle>
      }
      {...{ elevation: elevationStyle }}
      {...rest}
    >
      <TouchableRipple
        borderless
        delayPressIn={0}
        style={[{ borderRadius }, styles.touchable]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        underlayColor={underlayColor}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
      >
        <View style={[styles.content, styles.md3Content, contentSpacings]}>
          {icon || selected ? (
            <View style={[styles.icon, styles.md3Icon]}>
              {icon ? (
                <Icon name={icon} size="mega" />
              ) : (
                <Icon
                  name="icon-check"
                  // color={avatar ? '#ffffff' : iconColor}
                  size="deca"
                />
              )}
            </View>
          ) : null}
          <Text
            typography="base"
            selectable={false}
            numberOfLines={1}
            style={[
              styles.text,
              {
                color: textColor,
              },
              labelSpacings,
              textStyle,
            ]}
            ellipsizeMode={ellipsizeMode}
          >
            {children}
          </Text>
        </View>
      </TouchableRipple>
      {onClose ? (
        <View style={styles.closeButtonStyle}>
          <TouchableWithoutFeedback
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={closeIconAccessibilityLabel}
          >
            <View style={[styles.icon, styles.closeIcon, styles.md3CloseIcon]}>
              {closeIcon ? (
                <Icon
                  name="icon-cross"
                  // color={iconColor}
                  size={iconSize}
                />
              ) : (
                <Icon
                  name="icon-cross"
                  size={iconSize}
                  // color={iconColor}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      ) : null}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    flexDirection: Platform.select({ default: 'column', web: 'row' }),
  },
  md3OutlineContainer: {
    borderWidth: 1,
  },
  md3FlatContainer: {
    borderWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
    position: 'relative',
    flexGrow: 1,
  },
  md3Content: {
    paddingLeft: 0,
  },
  icon: {
    padding: 4,
    alignSelf: 'center',
  },
  md3Icon: {
    paddingLeft: 8,
    paddingRight: 0,
  },
  closeIcon: {
    marginRight: 4,
  },
  md3CloseIcon: {
    marginRight: 8,
    padding: 0,
  },
  text: {
    minHeight: 24,
    lineHeight: 24,
    textAlignVertical: 'center',
    marginVertical: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarWrapper: {
    marginRight: 4,
  },
  md3AvatarWrapper: {
    marginLeft: 4,
    marginRight: 0,
  },
  md3SelectedIcon: {
    paddingLeft: 4,
  },
  avatarSelected: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, .29)',
  },
  closeButtonStyle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    flexGrow: 1,
  },
});

export default Chip;
