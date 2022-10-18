import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import screens for this navigator

const AppNavigator = createNativeStackNavigator(
  {
    Splash: {screen: SplashScreen},
    Welcome: {screen: WelcomeScreen},
  },
  {
    mode: 'modal',
    headerMode: 'none',
    initialRouteName: 'Main',
  },
);

export default AppNavigator;
