import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  RefreshControlProps,
  SectionList,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { noHeader } from '../navigation/Headers';
import { useStoreState } from '../state/hooks';
import DrawerHeader from '../navigation/components/DrawerHeader';
import HomeActionsBar from '../components/HomeActionsBar';
import { Colors } from 'etta-ui';
import ContactsButton from '../navigation/components/ContactsButton';
import { moderateScale, scale, verticalScale } from '../utils/sizing';
import { HomeBalance } from '../components/HomeBalance';
import { isLdkRunning, waitForLdk } from '../ldk';
import { startLightning } from '../utils/lightning/helpers';
import usePaymentRequestBottomSheet from '../components/usePaymentRequestBottomSheet';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const WalletHomeScreen = () => {
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const currentBlockHeight = useStoreState((state) => state.wallet.header.height);

  const {
    openPaymentRequestSheet,
    newPaymentRequestBottomSheet,
    openSendSheet,
    sendBitcoinBottomSheet,
  } = usePaymentRequestBottomSheet({});
  const [refreshing, setRefreshing] = useState(false);

  const scrollPosition = useRef(new Animated.Value(0)).current;

  const keyExtractor = (_item: any, index: number) => {
    return index.toString();
  };

  const onRefreshLdk = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    const isLdkUp = await isLdkRunning();
    if (!isLdkUp) {
      await startLightning({});
    }
    await waitForLdk();
    setRefreshing(false);
  }, []);

  const refresh: React.ReactElement<RefreshControlProps> = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefreshLdk}
      colors={[Colors.orange.base]}
    />
  ) as React.ReactElement<RefreshControlProps>;

  // add sections showing balance, most recent transaction and a prompt to show all transactions. Keep clean
  const sections = [];

  const balanceSection = {
    data: [{}],
    renderItem: () => <HomeBalance key={'HomeBalance'} />,
  };

  // @ts-ignore
  sections.push(balanceSection);

  const NodeStatus = () => {
    // @todo: setup an enum to track Node state and switch color i.e:
    // synced, syncing, offline, with different color codes.
    return (
      <>
        <View style={styles.dotContainer} />
        <Text>{currentBlockHeight}</Text>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerHeader
        middleElement={<NodeStatus />}
        rightElement={<ContactsButton />}
        scrollPosition={scrollPosition}
        showLogo={false}
      />
      <AnimatedSectionList
        scrollEventThrottle={16}
        onScroll={() => 0}
        refreshControl={refresh}
        onRefresh={() => 0}
        refreshing={!nodeStarted}
        style={styles.container}
        sections={sections}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.balanceSection}
        showsVerticalScrollIndicator={false}
      />
      <HomeActionsBar onSend={openSendSheet} onRequest={openPaymentRequestSheet} />
      {newPaymentRequestBottomSheet}
      {sendBitcoinBottomSheet}
    </SafeAreaView>
  );
};

WalletHomeScreen.navigationOptions = noHeader;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  balanceSection: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonsGroup: {
    flexDirection: 'row',
    marginBottom: verticalScale(20),
  },
  dotContainer: {
    width: scale(8),
    borderRadius: scale(4),
    marginRight: moderateScale(8),
    height: verticalScale(8),
    backgroundColor: '#08CB7A',
    alignSelf: 'center',
  },
});

export default WalletHomeScreen;
