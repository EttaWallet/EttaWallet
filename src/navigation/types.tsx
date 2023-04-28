import { Screens } from './Screens';

export type StackParamList = {
  [Screens.ErrorScreen]: {
    errorMessage?: string;
  };
  [Screens.OnboardingSlidesScreen]: undefined;
  [Screens.InitScreen]:
    | {
        nextScreen: keyof StackParamList;
      }
    | undefined;
  [Screens.Disclaimer]: undefined;
  [Screens.EnterPinScreen]: {
    withVerification?: boolean;
    onSuccess: (pin: string) => void;
    onCancel: () => void;
    account?: string;
  };
  [Screens.SetPinScreen]:
    | {
        changePin?: boolean;
        choseRestoreWallet?: boolean;
      }
    | undefined;
  [Screens.EnableBiometryScreen]: undefined;
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
  [Screens.AnimatedModal]: undefined;
  [Screens.DrawerNavigator]: undefined;
  [Screens.ManualBackupScreen]: undefined;
  [Screens.ManualBackupQuizScreen]: undefined;
  [Screens.SeedPhraseScreen]: undefined;
  [Screens.SettingsScreen]: undefined;
  [Screens.HelpScreen]: undefined;
  [Screens.FAQScreen]: undefined;
  [Screens.TestScreen]: undefined;
  [Screens.StartLN]: undefined;
  [Screens.ReceiveScreen]: undefined;
};
