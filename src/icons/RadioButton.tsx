import * as React from 'react';
import { Circle, Svg } from 'react-native-svg';
import { Colors } from 'etta-ui';

interface Props {
  height?: number;
  color?: string;
  selected?: boolean;
  disabled?: boolean;
}

class RadioButton extends React.PureComponent<Props> {
  static defaultProps = {
    width: 20,
    height: 20,
    color: Colors.orange.base,
    selected: true,
    disabled: false,
  };

  render() {
    let stroke;
    if (this.props.disabled) {
      stroke = Colors.neutrals.light.neutral4;
    } else if (this.props.selected) {
      stroke = this.props.color;
    } else if (!this.props.selected) {
      stroke = Colors.neutrals.light.neutral4;
    }
    const fill = this.props.selected && !this.props.disabled ? this.props.color : undefined;
    return (
      <Svg height={this.props.height} width={this.props.height} viewBox="0 0 20 20">
        <Circle cx="10" cy="10" r="9" stroke={stroke} strokeWidth={2} />
        <Circle cx="10" cy="10" r="6" fill={fill} />
      </Svg>
    );
  }
}

export default React.memo(RadioButton);
