import { Colors, Icon } from 'etta-ui';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { pressableHitSlop } from '../utils/helpers';

interface ButtonProps {
  onPress: () => void;
  solid: boolean;
  style?: any;
  size?: number;
  borderWidth?: number;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}

export default class CircleButton extends React.PureComponent<ButtonProps> {
  static defaultProps = {
    size: 50,
    disable: false,
    activeColor: Colors.orange.base,
    inactiveColor: Colors.neutrals.light.neutral7,
  };

  render() {
    const { onPress, solid, borderWidth, disabled, size, activeColor, inactiveColor } = this.props;
    const color = disabled ? inactiveColor : activeColor;
    const buttonStyle = [
      styles.button,
      solid ? { backgroundColor: color } : { backgroundColor: 'transparent' },
      borderWidth !== undefined ? { borderWidth } : { borderWidth: 0 },
      { borderColor: color, width: size, height: size, borderRadius: Math.floor(size! / 2) },
    ];
    const xColor = solid ? Colors.red.base : color;

    return (
      <View style={[styles.row, this.props.style]}>
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          style={buttonStyle}
          hitSlop={pressableHitSlop}
        >
          <Icon name="icon-cross" style={{ color: xColor }} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
