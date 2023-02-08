import type { LayoutChangeEvent } from 'react-native';
import { Screens } from './Screens';

export type StackParamList = {
  [Screens.ErrorScreen]: {
    errorMessage?: string;
  };
  [Screens.OnboardingSlidesScreen]: undefined;
  [Screens.WelcomeScreen]: undefined;
  [Screens.RestoreWalletScreen]: undefined;
  [Screens.WalletHomeScreen]: undefined;
  [Screens.LangugageChooserScreen]:
    | {
        nextScreen: keyof StackParamList;
      }
    | undefined;
  [Screens.LanguageModal]:
    | {
        nextScreen: keyof StackParamList;
      }
    | undefined;
  [Screens.Main]: undefined;
  [Screens.MainModal]: undefined;
  [Screens.TestBottomSheet]: undefined;
};

export interface BottomSheetParams {
  handleContentLayout(event: LayoutChangeEvent): void;
}
