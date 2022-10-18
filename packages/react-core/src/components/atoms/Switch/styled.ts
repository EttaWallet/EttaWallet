import styled from '@emotion/native';
import { Animated } from 'react-native';
import { StyleProps } from '../../../types/defaults';
import { RFValueStr } from '../../../utils';

export const SWITCH_BODY_WIDTH = '45px';
export const SWITCH_PIN_WIDTH = '18px';

export const StyledSwitchContent = styled(Animated.View) <Partial<StyleProps>>`
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  padding: 0 ${({ theme }) => theme.spacing.micro};
  justify-content: center;
  width: ${RFValueStr(SWITCH_BODY_WIDTH)};
  height: ${RFValueStr('28px')};
`;

export const StyledSwitch = styled(Animated.View) <Partial<StyleProps>>`
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background-color: ${({ theme }) => theme.miscellaneous.surfaceColor};
  width: ${RFValueStr(SWITCH_PIN_WIDTH)};
  height: ${RFValueStr('18px')};
`;
