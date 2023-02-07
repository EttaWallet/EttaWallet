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
};
