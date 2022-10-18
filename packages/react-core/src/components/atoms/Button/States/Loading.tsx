import { useTheme } from '@emotion/react';
import React, { FC } from 'react';
import { ThemeProp, TypographyVariationType } from '../../../../types/defaults';
import { Text } from '../../Text';
import { ButtonStateProps } from '../Button';
import { getStyledTextButton, StyledIndicator } from './styled';

export const Loading: FC<ButtonStateProps> = ({
  text,
  textComponent = Text,
  fontColor = 'light',
  buttonSize = 'default',
}) => {
  const theme = useTheme() as ThemeProp;
  const typo: TypographyVariationType =
    buttonSize === 'default' ? 'base' : 'sub';
  const StyledText = getStyledTextButton(textComponent);
  return (
    <>
      <StyledIndicator
        color={theme.font.color[fontColor]}
        buttonSize={buttonSize}
      />
      {text && (
        <StyledText typography={typo} fontWeight="bold" fontColor={fontColor}>
          {text}
        </StyledText>
      )}
    </>
  );
};

export default Loading;
