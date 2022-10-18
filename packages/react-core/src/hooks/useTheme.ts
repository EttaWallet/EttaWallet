import { useTheme as useEmotionTheme } from '@emotion/react';
import { ThemeProp } from '../types/defaults';

export const useTheme = (): ThemeProp => useEmotionTheme() as ThemeProp;
