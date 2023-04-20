import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import type {
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from '@react-navigation/drawer/lib/typescript/src/types';
import {
  CommonActions,
  DrawerActions,
  DrawerNavigationState,
  ParamListBase,
  useLinkBuilder,
} from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import DrawerItem from './components/DrawerItem';
import { Screens } from './Screens';
import { APP_NAME } from '../../config';
import WalletHomeScreen from '../screens/WalletHomeScreen';
import { Colors, TypographyPresets } from 'etta-ui';
import TestScreen from '../screens/TestScreen';

const Drawer = createDrawerNavigator();

type CustomDrawerItemListProps = {
  state: DrawerNavigationState<ParamListBase>;
  navigation: DrawerNavigationHelpers;
  descriptors: DrawerDescriptorMap;
  protectedRoutes?: string[];
};

interface DrawerItemParams {
  onPress?: () => void;
}

function CustomDrawerItemList({
  state,
  navigation,
  descriptors,
  ...passThroughProps
}: CustomDrawerItemListProps) {
  const buildLink = useLinkBuilder();

  return state.routes.map((route, i) => {
    const focused = i === state.index;
    const { title, drawerLabel, drawerIcon } = descriptors[route.key].options;
    const navigateToItem = () => {
      navigation.dispatch({
        ...(focused ? DrawerActions.closeDrawer() : CommonActions.navigate(route.name)),
        target: state.key,
      });
    };
    const onPress = () => {
      if (route.params && (route.params as DrawerItemParams).onPress) {
        const drawerParams = route.params as DrawerItemParams;
        drawerParams.onPress?.();
      } else {
        navigateToItem();
      }
    };

    return (
      <DrawerItem
        {...passThroughProps}
        key={route.key}
        label={drawerLabel !== undefined ? drawerLabel : title !== undefined ? title : route.name}
        icon={drawerIcon}
        focused={focused}
        to={buildLink(route.name, route.params)}
        onPress={onPress}
      />
    );
  }) as React.ReactNode as React.ReactElement;
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const appName = APP_NAME;
  const appVersion = deviceInfoModule.getVersion();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerTop}>
        {!!appName && <Text style={styles.appLabel}>{appName}</Text>}
        <View style={styles.border} />
      </View>
      <CustomDrawerItemList {...props} />
      <View style={styles.drawerBottom}>
        <Text style={styles.smallLabel}>{t('version', { appVersion })}</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { t } = useTranslation();

  const drawerContent = (props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />;

  return (
    <Drawer.Navigator
      initialRouteName={Screens.WalletHomeScreen}
      drawerContent={drawerContent}
      backBehavior={'initialRoute'}
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
        drawerLabelStyle: [TypographyPresets.Body3, { marginLeft: -20, fontWeight: 'normal' }],
        drawerActiveBackgroundColor: Colors.neutrals.light.neutral2,
      }}
      // Whether inactive screens should be detached from the view hierarchy to save memory.
      // Defaults to true, but also explicitly set here.
      detachInactiveScreens={true}
    >
      <Drawer.Screen
        name={Screens.WalletHomeScreen}
        component={WalletHomeScreen}
        options={{ title: t('navigationLabels.home')!, unmountOnBlur: false }}
      />

      <Drawer.Screen
        name={Screens.SeedPhraseScreen}
        component={TestScreen}
        options={{ title: t('navigationLabels.seedPhrase')! }}
        initialParams={{ showDrawerTopBar: true }}
      />
      <Drawer.Screen
        name={Screens.SettingsScreen}
        component={TestScreen}
        options={{ title: t('navigationLabels.settings')! }}
      />
      <Drawer.Screen
        name={Screens.HelpScreen}
        component={TestScreen}
        options={{ title: t('navigationLabels.help')! }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerTop: {
    marginLeft: 16,
    marginTop: 16,
    alignItems: 'flex-start',
    marginRight: 16,
  },
  drawerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appLabel: {
    ...TypographyPresets.Body3,
    marginTop: 8,
  },
  border: {
    marginTop: 20,
    marginBottom: 12,
    height: 1,
    backgroundColor: Colors.neutrals.light.neutral2,
    alignSelf: 'stretch',
  },
  drawerBottom: {
    marginVertical: 32,
    marginHorizontal: 16,
  },
  smallLabel: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral4,
    marginTop: 32,
  },
});
