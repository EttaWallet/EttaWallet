import { ButtonSizeType, FontColor, Icon, IconProps } from '../../../';
import React, { FC } from 'react';

interface IconComponentProps {
  iconProps?: IconProps;
  size?: ButtonSizeType;
  defaultFontColor: keyof FontColor;
}

const IconComponent: FC<IconComponentProps> = ({
  iconProps,
  size = 'default',
  defaultFontColor,
}) => {
  return iconProps ? (
    <Icon
      size={iconProps.size ?? size === 'small' ? 'deca' : 'kilo'}
      fontColor={iconProps.fontColor ?? defaultFontColor}
      {...iconProps}
    />
  ) : (
    <></>
  );
};

export default React.memo(IconComponent);
