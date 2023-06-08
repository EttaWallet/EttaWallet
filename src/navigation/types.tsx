import { TLightningPayment } from '../utils/types';
import { Screens } from './Screens';

export type StackParamList = {
  [Screens.GenericErrorScreen]: {
    errorMessage?: string;
  };
  [Screens.OnboardingSlidesScreen]: undefined;
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
  [Screens.CurrencyChooserScreen]: undefined;
  [Screens.Main]: undefined;
  [Screens.AnimatedModal]: undefined;
  [Screens.DrawerNavigator]: undefined;
  [Screens.ManualBackupScreen]: undefined;
  [Screens.ManualBackupQuizScreen]: undefined;
  [Screens.GeneralSettingsScreen]: undefined;
  [Screens.SecuritySettingsScreen]: undefined;
  [Screens.WalletBackupScreen]: undefined;
  [Screens.LightningSettingsScreen]: undefined;
  [Screens.LightningSettingsScreen]: undefined;
  [Screens.LogsScreen]: undefined;
  [Screens.HelpScreen]: undefined;
  [Screens.FAQScreen]: undefined;
  [Screens.TestScreen]: undefined;
  [Screens.StartLN]: undefined;
  [Screens.StartLdkScreen]: undefined;
  [Screens.EnterAmountScreen]: undefined;
  [Screens.ReviewRequestScreen]:
    | {
        amount?: string;
      }
    | undefined;
  [Screens.ReceiveScreen]:
    | {
        amount?: string;
        feesPayable?: number;
      }
    | undefined;
  [Screens.LightningChannelsIntroScreen]: undefined;
  [Screens.JITLiquidityScreen]: {
    liquidityAmount?: string;
    paymentRequest?: string;
  };
  [Screens.ChannelsScreen]: undefined;
  [Screens.ActivityScreen]: undefined;
  [Screens.ActivityDetailsScreen]: {
    transaction: TLightningPayment;
  };
  [Screens.ActivityDetailsScreen]: {
    transaction: TLightningPayment;
  };
  [Screens.ScanQRCodeScreen]: undefined;
  [Screens.SendScreen]:
    | {
        amount?: string;
        paymentRequest?: string;
      }
    | undefined;
  [Screens.TransactionErrorScreen]: {
    errorMessage?: string;
    canRetry?: boolean;
    showSuggestions?: boolean;
  };
};
