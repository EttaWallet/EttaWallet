import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  RefreshControl,
  RefreshControlProps,
  SectionList,
  Text,
  View,
  Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { noHeader } from '../navigation/Headers';
import { useStoreState } from '../state/hooks';
import TopHeader from '../navigation/components/TopHeader';
import HomeActionsBar from '../components/HomeActionsBar';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import ContactsButton from '../navigation/components/ContactsButton';
import { moderateScale, scale, verticalScale } from '../utils/sizing';
import { isLdkRunning, refreshLdk, waitForLdk } from '../ldk';
import {
  countRecentTransactions,
  hasOpenLightningChannels,
  startLightning,
} from '../utils/lightning/helpers';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import useSendBottomSheet from '../components/useSendBottomSheet';
import useSettingsBottomSheet from '../components/useSettingsBottomSheet';
import AmountDisplay from '../components/amount/AmountDisplay';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import useContactsBottomSheet from '../components/useContactsBottomSheet';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const WalletHomeScreen = () => {
  const balance = useStoreState((state) => state.lightning.claimableBalance);
  const paymentsStore = useStoreState((state) => state.lightning.payments);

  const { openOptionsSheet, sendOptionsBottomSheet } = useSendBottomSheet({});
  const { PickContactBottomSheet } = useContactsBottomSheet({});

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

    await refreshLdk({});

    setRefreshing(false);
  }, []);

  const refresh: React.ReactElement<RefreshControlProps> = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefreshLdk}
      colors={[Colors.orange.base]}
    />
  ) as React.ReactElement<RefreshControlProps>;

  const transactions = Object.values(paymentsStore);
  const recentTxCount = countRecentTransactions(transactions);
  const allTxCount = transactions.length;
  const absoluteTxCount = allTxCount > recentTxCount ? allTxCount : recentTxCount;

  // add sections showing balance, most recent transaction and a prompt to show all transactions. Keep clean
  const sections = [];

  const balanceSection = {
    data: [{}],
    renderItem: () => <AmountDisplay inputAmount={balance.toString()} usingLocalCurrency={false} />,
  };
  // @ts-ignore
  sections.push(balanceSection);

  const transactionsSection = {
    data: [{}],
    renderItem: () => (
      <View style={styles.transactionsSection}>
        <TouchableWithoutFeedback onPress={onPressTransactions} style={styles.transactionsPill}>
          <Icon style={styles.transactionsIcon} name="icon-caret-up" />
          <Text style={styles.transactionsUpdate}>
            {absoluteTxCount > 0 ? `${absoluteTxCount} recent transactions` : 'Transaction history'}
          </Text>
        </TouchableWithoutFeedback>
      </View>
    ),
  };
  // @ts-ignore
  sections.push(transactionsSection);

  const syncStatus = refreshing ? 'Syncing...' : 'Synced';

  const syncStatusColor = refreshing ? Colors.orange.base : Colors.green.base;

  const onPressStatus = () => {
    Alert.alert(
      'Status',
      'Pull down to sync your node to the latest block tip and refresh your activity',
      [
        {
          text: 'Sync node',
          onPress: () => {
            onRefreshLdk();
          },
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };

  const NodeStatus = () => {
    // @todo: setup an enum to track Node state and switch color i.e:
    // synced, syncing, offline, with different color codes.
    return (
      <>
        <TouchableWithoutFeedback style={styles.statusContainer} onPress={onPressStatus}>
          <View style={[styles.dotContainer, { backgroundColor: syncStatusColor }]} />
          <Text style={styles.statusLabel}>{syncStatus}</Text>
        </TouchableWithoutFeedback>
      </>
    );
  };

  const onPressTransactions = () => {
    cueInformativeHaptic();
    navigate(Screens.ActivityScreen);
  };

  const onPressRequest = () => {
    cueInformativeHaptic();
    // check if open channels exist, if yes, proceed,
    // if no, start channel opening process
    if (hasOpenLightningChannels()) {
      navigate(Screens.EnterAmountScreen);
    } else {
      navigate(Screens.LightningChannelsIntroScreen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader
        middleElement={<NodeStatus />}
        leftElement={<ContactsButton />}
        scrollPosition={scrollPosition}
        onPressLogo={() => {
          cueInformativeHaptic();
          openSettingsSheet();
        }}
      />
      <AnimatedSectionList
        scrollEventThrottle={16}
        onScroll={() => 0}
        refreshControl={refresh}
        onRefresh={onRefreshLdk}
        refreshing={refreshing}
        style={styles.container}
        sections={sections}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.balanceSection}
        showsVerticalScrollIndicator={false}
      />
      <HomeActionsBar onPressSend={openOptionsSheet} onPressRequest={onPressRequest} />
      {sendOptionsBottomSheet}
      {settingsBottomSheet}
      {PickContactBottomSheet}
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
    justifyContent: 'center',
  },
  transactionsSection: {
    position: 'relative',
    alignItems: 'center',
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
  statusContainer: {
    flexDirection: 'row',
  },
  dotContainer: {
    width: scale(8),
    borderRadius: scale(4),
    marginRight: moderateScale(8),
    height: verticalScale(8),
    alignSelf: 'center',
  },
  statusLabel: {
    color: Colors.neutrals.light.neutral8,
  },
});

export default WalletHomeScreen;
