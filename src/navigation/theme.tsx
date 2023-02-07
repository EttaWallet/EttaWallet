import { DefaultTheme } from '@react-navigation/native';
import { Colors } from 'etta-ui';

// Global app theme used by react-navigation
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.common.white,
  },
};

export default navTheme;
