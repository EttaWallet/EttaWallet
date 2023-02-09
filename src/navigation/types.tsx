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
  [Screens.DrawerNavigator]: undefined;
  [Screens.ManualBackupScreen]: undefined;
  [Screens.ManualBackupQuizScreen]: undefined;
  [Screens.SeedPhraseScreen]: undefined;
  [Screens.SettingsScreen]: undefined;
  [Screens.HelpScreen]: undefined;
  [Screens.FAQScreen]: undefined;
};
