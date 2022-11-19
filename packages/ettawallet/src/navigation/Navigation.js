import React, { useState, useEffect, useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@ettawallet/react-native-kit';
import WelcomeScreen from '../screens/WelcomeScreen';
import RecoveryPhraseIntro from '../screens/RecoveryPhraseIntro';
import WriteRecoveryPhrase from '../screens/WriteRecoveryPhrase';
import ManualBackupQuiz, {
  navOptionsForQuiz,
} from '../screens/ManualBackupQuizScreen';
import ManualBackupComplete from '../screens/ManualBackupComplete';
import OnboardingSlides from '../screens/OnboardingSlides';
import SetPinCode from '../screens/SetPinCodeScreen';
import EnterPinCode from '../screens/EnterPinCodeScreen';
import LanguageChooser from '../screens/LanguageChooserScreen';
import SendBitcoin from '../screens/SendBitcoinScreen';
import ReceiveBitcoin from '../screens/ReceiveBitcoinScreen';
import ProtectWallet from '../screens/ProtectWalletScreen';
import SendBitcoinConfirmation from '../screens/SendBitcoinConfirmationScreen';
import WalletHome from '../screens/WalletHomeScreen';
import Startup from '../screens/StartupScreen';
import { noHeader } from './headers/Headers';
import Settings from '../screens/Settings/SettingsScreen';
import GeneralSettings from '../screens/Settings/GeneralSettingsScreen';
import LanguageSettings from '../screens/Settings/LanguageSettingsScreen';
import LocalCurrencySetting from '../screens/Settings/LocalCurrencySettingsScreen';

const OnboardingStack = createNativeStackNavigator();

const OnboardingRoot = () => {
  return (
    <OnboardingStack.Navigator
      initialRouteName="Startup"
      screenOptions={{ headerShown: false }}
    >
      <OnboardingStack.Screen
        name="Startup"
        component={Startup}
        options={noHeader}
      />
      <OnboardingStack.Screen
        name="Language"
        component={LanguageChooser}
        options={LanguageChooser.navigationOptions}
      />

      <OnboardingStack.Screen
        name="OnboardingSlides"
        component={OnboardingSlides}
        options={OnboardingSlides.navigationOptions}
      />
      <OnboardingStack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <OnboardingStack.Screen
        name="RecoveryPhraseIntro"
        component={RecoveryPhraseIntro}
        options={RecoveryPhraseIntro.navOps}
      />
      <OnboardingStack.Screen
        name="WriteRecoveryPhrase"
        component={WriteRecoveryPhrase}
        options={WriteRecoveryPhrase.navOps}
      />
      <OnboardingStack.Screen
        name="ManualBackupQuiz"
        component={ManualBackupQuiz}
        options={navOptionsForQuiz}
      />
      <OnboardingStack.Screen
        name="ManualBackupComplete"
        component={ManualBackupComplete}
        options={ManualBackupComplete.navOps}
      />
      <OnboardingStack.Screen
        name="ProtectWallet"
        component={ProtectWallet}
        options={ProtectWallet.navOps}
      />
      <OnboardingStack.Screen
        name="SetPin"
        component={SetPinCode}
        options={SetPinCode.navOpts}
      />
    </OnboardingStack.Navigator>
  );
};

const UnlockAppStack = createNativeStackNavigator();
const UnlockAppRoot = () => (
  <UnlockAppStack.Navigator
    name="UnlockAppRoot"
    screenOptions={{ headerShown: false }}
  >
    <UnlockAppStack.Screen
      name="EnterPin"
      component={EnterPinCode}
      initialParams={{ unlockOnComponentMount: true }}
    />
  </UnlockAppStack.Navigator>
);

const InitStack = createNativeStackNavigator();
const InitRoot = () => (
  <InitStack.Navigator initialRouteName="OnboardingRoot">
    <InitStack.Screen
      name="OnboardingRoot"
      component={OnboardingRoot}
      options={{ headerShown: false }}
    />
    <InitStack.Screen
      name="SendRoot"
      component={SendRoot}
      options={{ headerShown: false }}
    />
    <InitStack.Screen
      name="TabsRoot"
      component={TabsRoot}
      options={{ headerShown: false }}
    />
    <InitStack.Screen
      name="Navigation"
      component={Navigation}
      options={{ headerShown: false }}
    />
  </InitStack.Navigator>
);

const AnimatedModalStack = createNativeStackNavigator();
const animatedModalRoot = () => {
  <>
    <AnimatedModalStack.Screen
      name="EnterPin"
      component={EnterPinCode}
      options={EnterPinCode.navigationOptions}
    />
    <AnimatedModalStack.Screen
      name="RecoveryPhraseIntro"
      component={RecoveryPhraseIntro}
    />
  </>;
};

const TabsStack = createBottomTabNavigator();

const TabsRoot = () => {
  return (
    <TabsStack.Navigator
      initialRouteName="WalletHome"
      screenOptions={{
        tabBarActiveTintColor: '#F7931A',
        tabBarInactiveTintColor: '#777777',
        tabBarStyle: { height: 60, paddingVertical: 10 },
        tabBarLabelStyle: { fontSize: 12, paddingBottom: 8 },
      }}
    >
      <TabsStack.Screen
        name="WalletHome"
        component={WalletHome}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="icon-home-2"
              size="kilo"
              fontColor={focused ? 'orange' : 'dark'}
            />
          ),
        }}
      />
      <TabsStack.Screen
        name="SendBitcoin"
        component={SendBitcoin}
        options={{
          tabBarLabel: 'Send',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="icon-send-2"
              size="kilo"
              fontColor={focused ? 'orange' : 'dark'}
            />
          ),
        }}
      />
      <TabsStack.Screen
        name="ReceiveBitcoin"
        component={ReceiveBitcoin}
        options={{
          headerTitle: 'Share bitcoin address',
          tabBarLabel: 'Receive',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="icon-receive-2"
              size="kilo"
              fontColor={focused ? 'orange' : 'dark'}
            />
          ),
        }}
      />
      <TabsStack.Screen
        name="Activity"
        component={SendBitcoin} // change component
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="icon-transactions-2"
              size="kilo"
              fontColor={focused ? 'orange' : 'dark'}
            />
          ),
        }}
      />
      <TabsStack.Screen
        name="Settings"
        component={SettingsRoot} // change component
        options={{
          headerShown: false,
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="icon-gear"
              size="kilo"
              fontColor={focused ? 'orange' : 'dark'}
            />
          ),
        }}
      />
    </TabsStack.Navigator>
  );
};

const SettingsStack = createNativeStackNavigator();
const SettingsRoot = () => {
  return (
    <SettingsStack.Navigator
      initialRouteName="BaseSettings"
      screenOptions={{ headerShown: false }}
    >
      <SettingsStack.Screen
        name="BaseSettings"
        component={Settings}
        options={Settings.navigationOptions}
      />
      <SettingsStack.Screen
        name="GeneralSettings"
        component={GeneralSettings}
        options={GeneralSettings.navigationOptions}
      />
      <SettingsStack.Screen
        name="LanguageSettings"
        component={LanguageSettings}
        options={LanguageSettings.navigationOptions}
      />
      <SettingsStack.Screen
        name="CurrencySettings"
        component={LocalCurrencySetting}
        options={LocalCurrencySetting.navigationOptions}
      />
    </SettingsStack.Navigator>
  );
};

const SendStack = createNativeStackNavigator();
const SendRoot = () => {
  return (
    <SendStack.Navigator screenOptions={{ headerHideShadow: true }}>
      <SendStack.Screen
        name="SendBitcoinConfirmation"
        component={SendBitcoinConfirmation}
        options={SendBitcoinConfirmation.navigationOptions}
      />
    </SendStack.Navigator>
  );
};

const RootStack = createNativeStackNavigator();
// const NavigationDefaultOptions = { headerShown: false};
const Navigation = () => {
  return (
    <RootStack.Navigator
      initialRouteName="Language"
      screenOptions={{ headerHideShadow: true }}
    >
      <RootStack.Screen name="OnboardingRoot" component={OnboardingRoot} />
      <RootStack.Screen
        name="animatedModalRoot"
        component={animatedModalRoot}
      />
      <RootStack.Screen name="TabsRoot" component={TabsRoot} />
      <RootStack.Screen name="SettingsRoot" component={SettingsRoot} />
    </RootStack.Navigator>
  );
};

export default InitRoot;
