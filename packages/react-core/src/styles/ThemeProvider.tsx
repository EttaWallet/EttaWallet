import React, { FC } from 'react';
import { ThemeProvider as EmotionProvider } from '@emotion/react';
import { ThemeProviderProps } from '../types/defaults';

const ThemeProvider: FC<ThemeProviderProps> = ({
  theme,
  children,
}): JSX.Element => {
  return <EmotionProvider theme={theme}>{children}</EmotionProvider>;
};

export default ThemeProvider;
