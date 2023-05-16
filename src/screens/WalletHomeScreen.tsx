import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  RefreshControlProps,
  SectionList,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { noHeader } from '../navigation/Headers';
import { useStoreState } from '../state/hooks';
import DrawerHeader from '../navigation/components/DrawerHeader';
import HomeActionsBar from '../components/HomeActionsBar';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import ContactsButton from '../navigation/components/ContactsButton';
import { moderateScale, scale, verticalScale } from '../utils/sizing';
import { HomeBalance } from '../components/HomeBalance';
import { isLdkRunning, waitForLdk } from '../ldk';
import {
  countRecentTransactions,
  getLightningStore,
  startLightning,
} from '../utils/lightning/helpers';
import usePaymentRequestBottomSheet from '../components/usePaymentRequestBottomSheet';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import useSendBottomSheet from '../components/useSendBottomSheet';
import useSettingsBottomSheet from '../components/useSettingsBottomSheet';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const WalletHomeScreen = () => {
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const currentBlockHeight = useStoreState((state) => state.wallet.header.height);

  const { openPaymentRequestSheet, newPaymentRequestBottomSheet } = usePaymentRequestBottomSheet(
    {}
  );

  const { openOptionsSheet, sendOptionsBottomSheet } = useSendBottomSheet({});

  const { openSettingsSheet, settingsBottomSheet } = useSettingsBottomSheet();
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

  const paymentsStore = getLightningStore().payments;
  const transactions = Object.values(paymentsStore);
  const recentTxCount = countRecentTransactions(transactions);

  // add sections showing balance, most recent transaction and a prompt to show all transactions. Keep clean
  const sections = [];

  const balanceSection = {
    data: [{}],
    renderItem: () => <HomeBalance key={'HomeBalance'} />,
  };
  // @ts-ignore
  sections.push(balanceSection);

  const transactionsSection = {
    data: [{}],
    renderItem: () => (
      <View style={styles.transactionsSection}>
        <TouchableOpacity onPress={onPressTransactions} style={styles.transactionsPill}>
          <Icon style={styles.transactionsIcon} name="icon-caret-up" />
          <Text style={styles.transactionsUpdate}>{`${recentTxCount} recent transactions`}</Text>
        </TouchableOpacity>
      </View>
    ),
  };
  // @ts-ignore
  sections.push(transactionsSection);

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

  const onPressTransactions = () => {
    navigate(Screens.ActivityScreen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <DrawerHeader
        middleElement={<NodeStatus />}
        leftElement={<ContactsButton />}
        scrollPosition={scrollPosition}
        onPressLogo={openSettingsSheet}
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
      <HomeActionsBar onPressSend={openOptionsSheet} onPressRequest={openPaymentRequestSheet} />
      {newPaymentRequestBottomSheet}
      {sendOptionsBottomSheet}
      {settingsBottomSheet}
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
  transactionsSection: {
    position: 'relative',
    marginHorizontal: 'auto',
    marginTop: 100,
  },
  transactionsPill: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: Colors.neutrals.light.neutral2,
  },
  transactionsUpdate: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
    marginLeft: 5,
  },
  transactionsIcon: {
    paddingTop: 2,
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
