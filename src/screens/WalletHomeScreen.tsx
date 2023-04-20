import React, { useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  RefreshControlProps,
  SectionList,
  Text,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { noHeader } from '../navigation/Headers';
import { useStoreState } from '../state/hooks';
import DrawerHeader from '../navigation/components/DrawerHeader';
import HomeActionsBar from '../components/HomeActionsBar';
import { Colors } from 'etta-ui';
import ContactsButton from '../navigation/components/ContactsButton';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const WalletHomeScreen = () => {
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);

  const scrollPosition = useRef(new Animated.Value(0)).current;

  const keyExtractor = (_item: any, index: number) => {
    return index.toString();
  };

  const refresh: React.ReactElement<RefreshControlProps> = (
    <RefreshControl refreshing={nodeStarted} onRefresh={() => 0} colors={[Colors.green.base]} />
  ) as React.ReactElement<RefreshControlProps>;

  // add sections showing balance, most recent transaction and a prompt to show all transactions. Keep clean
  const sections = [];

  return (
    <SafeAreaView style={styles.container}>
      <DrawerHeader
        middleElement={<Text>Synced</Text>}
        rightElement={<ContactsButton />}
        scrollPosition={scrollPosition}
        showLogo={false}
      />
      <AnimatedSectionList
        scrollEventThrottle={16}
        onScroll={() => 0}
        refreshControl={refresh}
        onRefresh={() => 0}
        refreshing={nodeStarted}
        style={styles.container}
        sections={sections}
        keyExtractor={keyExtractor}
      />
      <HomeActionsBar />
    </SafeAreaView>
  );
};

WalletHomeScreen.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  homeButtonsGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
});

export default WalletHomeScreen;
