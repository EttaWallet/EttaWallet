import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@ettawallet/react-native-kit';
import WelcomeScreen from '../screens/WelcomeScreen';
import RecoveryPhraseSlides from '../screens/RecoveryPhraseSlides';
import WriteRecoveryPhrase from '../screens/WriteRecoveryPhrase';
import ManualBackupQuiz, {
  navOptionsForQuiz,
} from '../screens/ManualBackupQuizScreen';
import ManualBackupComplete from '../screens/ManualBackupComplete';
import SetPinCode from '../screens/SetPinCodeScreen';
import EnterPinCode from '../screens/EnterPinCodeScreen';
import LanguageChooser from '../components/LanguageChooser';
import Transact from '../screens/TransactScreen';

const OnboardingStack = createNativeStackNavigator();

const OnboardingRoot = () => {
  return (
    <OnboardingStack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <OnboardingStack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <OnboardingStack.Screen
        name="SetPin"
        component={SetPinCode}
        options={SetPinCode.navOpts}
      />
      <OnboardingStack.Screen
        name="RecoveryPhraseSlides"
        component={RecoveryPhraseSlides}
        options={RecoveryPhraseSlides.navOps}
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
      name="Navigation"
      component={Navigation}
      options={{ headerShown: false }}
    />
  </InitStack.Navigator>
);

const SettingsStack = createNativeStackNavigator();
const SettingsRoot = () => {
  <SettingsStack.Navigator>
    <SettingsStack.Screen
      name="Language"
      component={LanguageChooser}
      options={LanguageChooser.navigationOptions(false)}
    />
  </SettingsStack.Navigator>;
};

const AnimatedModalStack = createNativeStackNavigator();
const animatedModalRoot = () => {
  <>
    <AnimatedModalStack.Screen
      name="EnterPin"
      component={EnterPinCode}
      options={EnterPinCode.navigationOptions}
    />
    <AnimatedModalStack.Screen
      name="RecoveryPhraseSlides"
      component={RecoveryPhraseSlides}
    />
  </>;
};

const TabsStack = createBottomTabNavigator();

const TabsRoot = () => {
  return (
    <TabsStack.Navigator
      initialRouteName="Transact"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F7931A',
        tabBarInactiveTintColor: '#777777',
        tabBarStyle: { height: 60, paddingVertical: 10 },
        tabBarLabelStyle: { fontSize: 12, paddingBottom: 8 },
      }}
    >
      <TabsStack.Screen
        name="Transact"
        component={Transact}
        options={{
          tabBarLabel: 'Transact',
          tabBarIcon: ({ focused }) => (
            <Icon
              name="icon-flip-vertical-2"
              size="kilo"
              fontColor={focused ? 'orange' : 'dark'}
            />
          ),
        }}
      />
      <TabsStack.Screen
        name="Activity"
        component={Transact} // change component
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
        component={Transact} // change component
        options={{
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

const RootStack = createNativeStackNavigator();
// const NavigationDefaultOptions = { headerShown: false};
const Navigation = () => {
  return (
    <RootStack.Navigator
      initialRouteName="WelcomeScreen"
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
