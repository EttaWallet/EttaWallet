import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Button, Colors, Switch, TypographyPresets } from 'etta-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CancelButton from '../../navigation/components/CancelButton';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';
import { ListItemWithIcon } from '../../components/InfoListItem';
//@ts-ignore
import RecoveryPhraseContainer from '../../components/RecoveryPhraseContainer';
import QRCode from 'react-native-qrcode-svg';
import { getMnemonicPhrase } from '../../utils/lightning/helpers';
import { showErrorBanner } from '../../utils/alerts';

const WINDOW_WIDTH = Dimensions.get('window').width;
const QR_CODE_WIDTH = WINDOW_WIDTH - 150;

const useWalletBackupBottomSheet = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const cloudOptionsBottomSheetRef = useRef<BottomSheet>(null);
  const recoveryPhraseBottomSheetRef = useRef<BottomSheet>(null);

  const [checked, setChecked] = useState(false);
  const [mnemonic, setMnemonic] = useState<string[]>([]);

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const phraseContainerSnapPoints = useMemo(() => ['85%'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const openCloudOptionsSheet = () => {
    cloudOptionsBottomSheetRef.current?.snapToIndex(0);
  };

  const openRecoveryPhraseSheet = () => {
    recoveryPhraseBottomSheetRef.current?.snapToIndex(0);
  };

  useEffect(() => {
    getMnemonicPhrase().then((res) => {
      if (res.isErr()) {
        showErrorBanner({
          title: t('mnemonic_error'),
          message: res.error.message,
        });
        return;
      }
      setMnemonic(res.value.split(' '));
    });
  }, [t]);

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.2} />
    ),
    []
  );

  const cloudOptionsBottomSheet = useMemo(() => {
    const onPressManual = () => {
      cueInformativeHaptic();
      // do
    };

    return (
      <BottomSheet
        ref={cloudOptionsBottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          {/* options list */}
          <ListItemWithIcon
            title="Apple iCloud"
            withIcon={true}
            icon="icon-cloud"
            onPress={onPressManual}
          />
          <ListItemWithIcon
            title="None"
            withIcon={true}
            icon="icon-cross"
            onPress={onPressManual}
          />
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
  ]);

  const recoveryPhraseBottomSheet = useMemo(() => {
    const onPressDone = () => {
      cueInformativeHaptic();
      recoveryPhraseBottomSheetRef.current?.close();
    };

    const onPressCancel = () => {
      cueInformativeHaptic();
      recoveryPhraseBottomSheetRef.current?.close();
    };

    const onPressToggle = (value) => {
      setChecked(value);
    };

    const onPressToggleArea = () => {
      onPressToggle(!checked);
    };

    return (
      <BottomSheet
        ref={recoveryPhraseBottomSheetRef}
        index={-1}
        snapPoints={phraseContainerSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          <View style={styles.cancelBtn}>
            <CancelButton onCancel={onPressCancel} />
          </View>
          <Text style={styles.title}>This is your recovery phrase</Text>
          <Text style={styles.subtitle}>
            Make sure to write it down as shown here, including both numbers and words.
          </Text>
          {checked ? (
            <View style={styles.qrContainer}>
              <QRCode
                value={mnemonic.toString()}
                size={QR_CODE_WIDTH}
                backgroundColor={Colors.common.white}
                color={Colors.common.black}
              />
            </View>
          ) : (
            <RecoveryPhraseContainer words={mnemonic} />
          )}
          <View style={styles.toggleContainer}>
            <Switch value={checked} onValueChange={onPressToggle} />
            <Text onPress={onPressToggleArea} style={styles.switchLabel}>
              Toggle QR code
            </Text>
          </View>
          <Button
            title="Done"
            onPress={onPressDone}
            size="default"
            appearance="filled"
            style={styles.button}
          />
        </View>
      </BottomSheet>
    );
  }, [
    phraseContainerSnapPoints,
    renderBackdrop,
    paddingBottom,
    handleContentLayout,
    checked,
    mnemonic,
  ]);

  return {
    openCloudOptionsSheet,
    cloudOptionsBottomSheet,
    openRecoveryPhraseSheet,
    recoveryPhraseBottomSheet,
  };
};

const styles = StyleSheet.create({
  handle: {
    backgroundColor: Colors.orange.base,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  title: {
    ...TypographyPresets.Header5,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    ...TypographyPresets.Body4,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  cancelBtn: {
    marginBottom: 5,
    alignItems: 'flex-end',
  },
  toggleContainer: {
    marginTop: 16,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  switchLabel: {
    flex: 1,
    ...TypographyPresets.Body5,
    paddingLeft: 8,
  },
});

export default useWalletBackupBottomSheet;
