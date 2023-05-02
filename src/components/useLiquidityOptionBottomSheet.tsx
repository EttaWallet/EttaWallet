import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Colors, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from './Card';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

const useLiquidityOptionBottomSheet = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 24);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const openSheet = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const renderBackdrop = useCallback(
    (props) => (
      // added opacity here, default is 0.5
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.2} />
    ),
    []
  );

  const SelectLiquidityOptionBottomSheet = useMemo(() => {
    const onPressAutomatic = () => {
      cueInformativeHaptic();
      navigate(Screens.JITLiquidityScreen);
    };
    const onPressCustom = () => {
      // @todo: Figure out custom liquidity flow
      return 0; //for now
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={animatedSnapPoints}
        handleHeight={animatedHandleHeight}
        contentHeight={animatedContentHeight}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.container, { paddingBottom }]} onLayout={handleContentLayout}>
          <Text style={styles.title}>{t('Choose liquidity option')}</Text>
          <Card style={styles.card} rounded={true} shadow={true}>
            <TouchableOpacity style={styles.pressableCard} onPress={onPressAutomatic}>
              <>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitleAuto}>Easy</Text>
                  <Text style={styles.itemSubtitle}>
                    Recommended. Purchase inbound liquidity from Voltage, a Lightning Service
                    Provider
                  </Text>
                </View>
              </>
            </TouchableOpacity>
          </Card>
          <Card style={styles.card} rounded={true} shadow={true}>
            <TouchableOpacity style={styles.pressableCard} onPress={onPressCustom}>
              <>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Custom</Text>
                  <Text style={styles.itemSubtitle}>
                    Use your own node or another LSP to handle liquidity
                  </Text>
                </View>
              </>
            </TouchableOpacity>
          </Card>
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
    t,
  ]);

  return {
    openSheet,
    SelectLiquidityOptionBottomSheet,
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
  title: {
    ...TypographyPresets.Header4,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    justifyContent: 'center',
    marginVertical: 16,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  pressableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 16,
    flex: 1,
    alignItems: 'center',
    padding: 0,
  },
  itemTitleAuto: {
    ...TypographyPresets.Header5,
    lineHeight: 24,
    color: Colors.orange.base,
  },
  itemTitle: {
    ...TypographyPresets.Header5,
    lineHeight: 24,
    color: Colors.common.black,
  },
  itemSubtitle: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
});

export default useLiquidityOptionBottomSheet;
