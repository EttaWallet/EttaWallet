import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import FormInput from './form/Input';
import RadioCardOption from './RadioCardOption';
import { isLdkRunning, waitForLdk } from '../ldk';
import { createLightningInvoice, startLightning } from '../utils/lightning/helpers';
import { sleep } from '../utils/helpers';

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

  const [isLoading, setIsLoading] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [liquidityOption, setLiquidityOption] = useState('Default');
  const [invoice, setInvoice] = useState('');

  const onSelect = (title: string, option: string) => {
    // eslint-disable-next-line no-void
    void setLiquidityOption(option);
  };
  const SelectLiquidityOptionBottomSheet = useMemo(() => {
    async function fetchInvoice() {
      setIsLoading(true);
      try {
        // ensure Ldk is up
        const isLdkUp = await isLdkRunning();
        if (!isLdkUp) {
          await startLightning({});
        }
        await waitForLdk();
        // proceed to create invoice
        const generateInvoice = await createLightningInvoice({
          amountSats: parseInt(liquidityAmount, 10),
          description: 'Zero conf channel for inbound liquidity',
          expiryDeltaSeconds: 86400, // expires after 24 hours
        });

        if (generateInvoice.isErr()) {
          console.log(generateInvoice.error.message);
          return;
        }
        setInvoice(generateInvoice.value.to_str);
        setIsLoading(false);
      } catch (e) {
        console.log(`Error: ${e.message}`);
      }
    }

    const onPressOpen = async () => {
      try {
        cueInformativeHaptic();
        await sleep(5);
        await fetchInvoice();
        // check if invoice was set
        if (invoice === '') {
          return Error('No invoice was generated');
        } else {
          requestAnimationFrame(() => {
            navigate(Screens.JITLiquidityScreen, {
              liquidityAmount: liquidityAmount,
              paymentRequest: invoice,
            });
          });
        }
      } catch (e) {
        console.log('Somethng happened while fetching the invoice');
      }
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
          <Text style={styles.title}>{t('Channel capacity')}</Text>
          <FormInput
            label={t('Maximum amount you want to be able to send or receive')}
            onChangeText={setLiquidityAmount}
            value={liquidityAmount}
            enablesReturnKeyAutomatically={true}
            placeholder="Amount in sats" // should pass value of amount from receive Screen
            multiline={false}
            keyboardType={'decimal-pad'}
          />
          <Text style={styles.title}>{t('Choose liquidity option')}</Text>

          <RadioCardOption
            hideRadio={!true}
            title="Default"
            description="Recommended. Purchase a channel from Voltage, a Lightning Service
            Provider"
            key="default"
            onSelect={onSelect}
            isSelected={liquidityOption === 'Default'}
            data={'Default'}
          />
          <RadioCardOption
            hideRadio={!true}
            title="Custom"
            description="Use your own node or another LSP to handle liquidity"
            key="custom"
            onSelect={onSelect}
            isSelected={liquidityOption === 'Custom'}
            data={'Custom'}
            disabled={true}
          />
          <Button
            title={isLoading ? 'Loading...' : 'Open new channel'}
            size="default"
            iconPosition="left"
            icon="icon-channels"
            onPress={onPressOpen}
            style={styles.button}
            disabled={!liquidityAmount || isLoading}
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
    t,
    liquidityAmount,
    liquidityOption,
    isLoading,
    invoice,
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
    ...TypographyPresets.Header5,
    marginVertical: 16,
    textAlign: 'left',
  },
  button: {
    justifyContent: 'center',
    marginVertical: 16,
  },
});

export default useLiquidityOptionBottomSheet;
