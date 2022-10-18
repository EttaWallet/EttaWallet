import {createNativeStackNavigator} from '@react-navigation/native-stack';

const MainNavigator = createNativeStackNavigator(
  {
    Main: {screen: MainNavigator},
  },
  {
    mode: 'modal',
    headerMode: 'none',
    initialRouteName: 'Main',
  },
);

export default MainNavigator;
