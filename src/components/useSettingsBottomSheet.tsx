import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Colors, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cueErrorHaptic, cueInformativeHaptic } from '../utils/accessibility/haptics';
import { SettingsItemWithIcon } from './InfoListItem';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { wipeEttaWallet } from '../utils/helpers';
import { showWarningBanner } from '../utils/alerts';
import { useStoreState } from '../state/hooks';

const useSettingsBottomSheet = () => {
  const versionNumber = useStoreState((state) => state.app.appVersion);
  const buildNumber = useStoreState((state) => state.app.appBuild);
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const settingsBottomSheetRef = useRef<BottomSheet>(null);

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const openSettingsSheet = () => {
    settingsBottomSheetRef.current?.snapToIndex(0);
  };

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.2} />
    ),
    []
  );

  const settingsBottomSheet = useMemo(() => {
    const onPressGeneral = () => {
      cueInformativeHaptic();
      navigate(Screens.GeneralSettingsScreen);
    };
    const onPressSecurity = () => {
      cueInformativeHaptic();
      navigate(Screens.SecuritySettingsScreen);
    };

    const onPressBackup = () => {
      cueInformativeHaptic();
      navigate(Screens.WalletBackupScreen);
    };

    const onPressLN = () => {
      cueInformativeHaptic();
      navigate(Screens.LightningSettingsScreen);
    };

    const onPressHelp = () => {
      cueInformativeHaptic();
      showWarningBanner({ message: 'Unavailable at the moment' });
    };

    const onPressReset = () => {
      Alert.alert('Are you sure? 😰', 'This will wipe EttaWallet and reset everything!', [
        {
          text: 'Proceed',
          onPress: () => {
            cueErrorHaptic();
            wipeEttaWallet();
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Wipe cancelled'),
          style: 'cancel',
        },
      ]);
    };

    return (
      <BottomSheet
        ref={settingsBottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          <Text style={styles.title}>Manage</Text>
          {/* options list */}
          <SettingsItemWithIcon
            title="General"
            withIcon={true}
            icon="icon-gear"
            onPress={onPressGeneral}
          />
          <SettingsItemWithIcon
            title="Security"
            withIcon={true}
            icon="icon-lock"
            onPress={onPressSecurity}
          />
          <SettingsItemWithIcon
            title="Wallet backup"
            withIcon={true}
            icon="icon-mnemonic"
            onPress={onPressBackup}
          />
          <SettingsItemWithIcon
            title="Lightning network"
            withIcon={true}
            icon="icon-lightning"
            onPress={onPressLN}
          />
          <SettingsItemWithIcon
            title="Help & support"
            withIcon={true}
            icon="icon-question"
            onPress={onPressHelp}
          />
          <SettingsItemWithIcon
            title="Reset EttaWallet"
            withIcon={true}
            icon="icon-cross"
            onPress={onPressReset}
          />
          <Text style={styles.version}>{`EttaWallet v${versionNumber} (${buildNumber}) `}</Text>
        </View>
      </BottomSheet>
    );
  }, [
    animatedSnapPoints,
    animatedHandleHeight,
    animatedContentHeight,
    renderBackdrop,
    paddingBottom,
    handleContentLayout,
    versionNumber,
    buildNumber,
  ]);

  return {
    openSettingsSheet,
    settingsBottomSheet,
  };
};

const styles = StyleSheet.create({
  handle: {
    backgroundColor: Colors.orange.base,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    ...TypographyPresets.Header5,
    marginBottom: 16,
  },
  cancelBtn: {
    marginBottom: 5,
    alignItems: 'flex-end',
  },
  version: {
    ...TypographyPresets.Body5,
    textAlign: 'center',
    paddingVertical: 8,
    marginVertical: 8,
    fontFamily: 'Inter-SemiBold',
  },
});

export default useSettingsBottomSheet;
