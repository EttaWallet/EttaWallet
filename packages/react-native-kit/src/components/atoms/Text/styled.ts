import styled, { css } from '@emotion/native';
import {
  FontStackType,
  FontWeightType,
  StyleProps,
  Text,
} from '@ettawallet/react-core';
import { Platform } from 'react-native';
import { TextNativeProps } from './Text';

export interface Font {
  fontStack?: FontStackType;
  fontWeight?: FontWeightType;
}

export const fontStyles = ({
  theme,
  fontStack = 'default',
  fontWeight = 'regular',
}: Partial<Font & Partial<StyleProps>>) => {
  const fontFamily = theme?.font.stack[fontStack] || '';
  const fontStyle = theme?.font.files[fontWeight];
  return css`
    ${Platform.OS === 'android' ? 'font-weight: normal;' : undefined}
    font-family: ${fontStyle?.replace('{0}', fontFamily)};
  `;
};

export const StyledNativeText = styled(Text)<
  Font & Partial<TextNativeProps> & Partial<StyleProps>
>(fontStyles);
