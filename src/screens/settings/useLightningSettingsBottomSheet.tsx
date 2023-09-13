import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetTextInput,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';
import { useStoreDispatch, useStoreState } from '../../state/hooks';
import RadioCardOption from '../../components/RadioCardOption';

const useLightningSettingsBottomSheet = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const updateDescriptionBottomSheetRef = useRef<BottomSheet>(null);
  const updateExpiryBottomSheetRef = useRef<BottomSheet>(null);

  const defaultDescription = useStoreState((state) => state.lightning.defaultPRDescription);
  const defaultExpiry = useStoreState((state) => state.lightning.defaultPRExpiry);

  const [newDescription, setNewDescription] = useState(defaultDescription);
  const [newExpiry, setNewExpiry] = useState(defaultExpiry);

  const dispatch = useStoreDispatch();

  const initialSnapPoints = useMemo(() => ['30%'], []);
  const pickexpirySnapPoints = useMemo(() => ['55%'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const openUpdateDescriptionSheet = () => {
    updateDescriptionBottomSheetRef.current?.snapToIndex(0);
  };

  const openUpdateExpirySheet = () => {
    updateExpiryBottomSheetRef.current?.snapToIndex(0);
  };

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.2} />
    ),
    []
  );

  const updateDescriptionBottomSheet = useMemo(() => {
    const onPressUpdate = () => {
      dispatch.lightning.setDefaultPRDescription(newDescription);
      updateDescriptionBottomSheetRef.current?.close();
    };

    return (
      <BottomSheet
        ref={updateDescriptionBottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t('Default invoice description')}</Text>
          <BottomSheetTextInput
            onChangeText={setNewDescription}
            value={newDescription}
            enablesReturnKeyAutomatically={true}
            returnKeyLabel="done"
            multiline={false}
            placeholderTextColor={Colors.neutrals.light.neutral7}
            style={styles.textInput}
          />
          <Button
            title="Update"
            onPress={onPressUpdate}
            size="default"
            appearance="filled"
            style={styles.button}
          />
        </View>
      </BottomSheet>
    );
  }, [animatedSnapPoints, renderBackdrop, t, newDescription, dispatch.lightning]);

  const updateExpiryBottomSheet = useMemo(() => {
    const onPressUpdate = () => {
      cueInformativeHaptic();
      dispatch.lightning.setDefaultPRExpiry(newExpiry);
      updateExpiryBottomSheetRef.current?.close();
    };

    const onSelect = (title: string, option: number) => {
      // eslint-disable-next-line no-void
      void setNewExpiry(option);
    };

    return (
      <BottomSheet
        ref={updateExpiryBottomSheetRef}
        index={-1}
        snapPoints={pickexpirySnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          <Text style={styles.title}>{t('Choose default invoice expiry period')}</Text>
          <RadioCardOption
            hideRadio={!true}
            title="1 week"
            description="Payment request expires in 7 days"
            key={604800}
            onSelect={onSelect}
            isSelected={newExpiry === 604800}
            data={604800}
          />
          <RadioCardOption
            hideRadio={!true}
            title="1 month"
            description="Payment request expires in 30 days"
            key={2.592e6}
            onSelect={onSelect}
            isSelected={newExpiry === 2.592e6}
            data={2.592e6}
          />
          <RadioCardOption
            hideRadio={!true}
            title="2 months"
            description="Payment request expires in 60 days"
            key={5.184e6}
            onSelect={onSelect}
            isSelected={newExpiry === 5.184e6}
            data={5.184e6}
          />
          <Button
            title="Update"
            onPress={onPressUpdate}
            size="default"
            appearance="filled"
            style={styles.button}
          />
        </View>
      </BottomSheet>
    );
  }, [
    pickexpirySnapPoints,
    animatedHandleHeight,
    animatedContentHeight,
    renderBackdrop,
    paddingBottom,
    handleContentLayout,
    t,
    newExpiry,
    dispatch.lightning,
  ]);

  return {
    openUpdateDescriptionSheet,
    updateDescriptionBottomSheet,
    openUpdateExpirySheet,
    updateExpiryBottomSheet,
  };
};

const styles = StyleSheet.create({
  handle: {
    backgroundColor: Colors.orange.base,
  },
  container: {
    padding: 16,
  },
  title: {
    ...TypographyPresets.Body4,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    ...TypographyPresets.Body4,
    marginBottom: 16,
    textAlign: 'center',
  },
  field: {
    marginVertical: 10,
  },
  button: {
    justifyContent: 'center',
    marginTop: 16,
  },
  cancelBtn: {
    marginBottom: 5,
    alignItems: 'flex-end',
  },
  textInput: {
    padding: 12,
    marginTop: 12,
    justifyContent: 'flex-end',
    borderColor: Colors.neutrals.light.neutral3,
    borderRadius: 4,
    borderWidth: 1.5,
    color: Colors.common.black,
  },
});

export default useLightningSettingsBottomSheet;
