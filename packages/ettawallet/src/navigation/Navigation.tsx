import * as React from 'react';
import { lightTheme, ThemeProvider, Icon } from '@ettawallet/react-native-kit';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { createBottomSheetNavigator } from '@th3rdwave/react-navigation-bottom-sheet';
import { PixelRatio, Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import AppLoading from '../../AppLoading';
import WelcomeScreen from '../screens/WelcomeScreen';
import RecoveryPhraseSlides from '../screens/RecoveryPhraseSlides';
import WriteRecoveryPhrase from '../screens/WriteRecoveryPhrase';
import Backup from '../screens/BackUpScreen';
import ImproveSecurity from '../screens/ImproveSecurityScreen';
import FundWallet from '../screens/FundWalletScreen';
import DepositBitcoin from '../screens/DepositBitcoinScreen';
import Transact from '../screens/TransactScreen';
import TransactionDetail from '../screens/TransactionDetailScreen';
import WalletGenerator from '../screens/WalletGenerationScreen';
import ManualBackupQuiz, {
  navOptionsForQuiz,
} from '../screens/ManualBackupQuizScreen';
import SetPinCode from '../screens/SetPinCodeScreen';
import { Screens } from './Screens';
import { StackParamList } from './Params';

const Stack = createNativeStackNavigator<StackParamList>();
const ModalStack = createNativeStackNavigator<StackParamList>();
const TabStack = createBottomTabNavigator<StackParamList>();
const BottomSheetStack = createBottomSheetNavigator<StackParamList>();
