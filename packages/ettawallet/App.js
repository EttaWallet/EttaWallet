import React from 'react';
import { lightTheme, ThemeProvider, Icon } from '@ettawallet/react-native-kit';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WelcomeScreen from './src/screens/WelcomeScreen';
import RecoveryPhraseSlides from './src/screens/RecoveryPhraseSlides';
import WriteRecoveryPhrase from './src/screens/WriteRecoveryPhrase';
import Backup from './src/screens/BackUpScreen';
import ImproveSecurity from './src/screens/ImproveSecurityScreen';
import FundWallet from './src/screens/FundWalletScreen';
import DepositBitcoin from './src/screens/DepositBitcoinScreen';
import Transact from './src/screens/TransactScreen';
import TransactionDetail from './src/screens/TransactionDetailScreen';
import WalletGenerator from './src/screens/WalletGenerationScreen';
import SetPinCode from './src/screens/SetPinCodeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainScreenNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="Transact"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#F7931A',
        tabBarInactiveTintColor: '#777777',
        tabBarStyle: { height: 60, paddingVertical: 10 },
        tabBarLabelStyle: { fontSize: 12, paddingBottom: 8 },
      }}
    >
      <Tab.Screen
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
      <Tab.Screen
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
      <Tab.Screen
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
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SetPin" component={SetPinCode} />
          <Stack.Screen
            name="RecoveryPhraseSlides"
            component={RecoveryPhraseSlides}
          />
          <Stack.Screen
            name="WriteRecoveryPhrase"
            component={WriteRecoveryPhrase}
          />
          <Stack.Screen name="WalletGenerator" component={WalletGenerator} />
          <Stack.Screen name="Backup" component={Backup} />
          <Stack.Screen name="ImproveSecurity" component={ImproveSecurity} />
          <Stack.Screen name="FundWallet" component={FundWallet} />
          <Stack.Screen name="DepositBitcoin" component={DepositBitcoin} />
          <Stack.Screen name="MainArea" component={MainScreenNavigation} />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetail}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
