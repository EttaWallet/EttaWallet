import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { HeaderTitleWithSubtitle, initOnboardingNavigationOptions } from '../navigation/Headers';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import QRCode from 'react-native-qrcode-svg';
import KeyboardAwareScrollView from '../components/keyboard/KeyboardInScrollView';
import KeyboardSpacer from '../components/keyboard/KeyboardSpacer';
import { VOLTAGE_LSP_API_TESTNET, VOLTAGE_LSP_FEE_ESTIMATE_API } from '../../config';
import InvoiceActionsBar from '../components/InvoiceActionsBar';
import { Screens } from '../navigation/Screens';
import { StackParamList } from '../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InfoListItem } from '../components/InfoListItem';
import CancelButton from '../navigation/components/CancelButton';
import { navigate } from '../navigation/NavigationService';
import { showSuccessBanner, showWarningBanner } from '../utils/alerts';
import { getLightningStore } from '../utils/lightning/helpers';

const WINDOW_WIDTH = Dimensions.get('window').width;
const QR_CODE_WIDTH = WINDOW_WIDTH - 170;

type Props = NativeStackScreenProps<StackParamList, Screens.JITLiquidityScreen>;

const JITLiquidityScreen = ({ navigation, route }: Props) => {
  const requestLiquidity = route.params.liquidityAmount!;
  const nodeInvoice = route.params.paymentRequest!;

  console.log(nodeInvoice);

  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [wrappedInvoice, setWrappedInvoice] = useState(undefined);
  const [wrappedInvoiceFees, setWrappedInvoiceFees] = useState(0);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const onPressCancel = () => {
    navigate(Screens.DrawerNavigator);
  };

  const onPressContinue = () => {
    navigate(Screens.DrawerNavigator);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTitleWithSubtitle title={t('Open a channel')!} subTitle="Channel details" />
      ),
      headerRight: () => <CancelButton onCancel={onPressCancel} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const getWrappedInvoice = async () => {
    // get wrapped invoice
    setIsLoading(true);
    try {
      await fetch(VOLTAGE_LSP_API_TESTNET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bolt11: nodeInvoice,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            // Handle error response
            throw new Error('The LSP is unavailable to fulfill this order');
          }
        })
        .then((data) => {
          setWrappedInvoice(data.jit_bolt11);
          console.log('wrapped: ', wrappedInvoice);
        })
        .catch((error) => {
          showWarningBanner({
            title: "There's a problem!",
            message: error.message,
          });
        });
      setIsLoading(false);
    } catch (e) {
      // console.error(e.message);
      showWarningBanner({
        message: e.message,
      });
    }
  };

  const confirmChannelOpen = () => {
    setPaymentConfirmed(false);
    // get openchannel ids from lightning store
    const openChannelIds = getLightningStore().openChannelIds;
    // get all channels from lightning store
    const channels = getLightningStore().channels;

    const openChannels = Object.values(channels).filter((channel) => {
      return openChannelIds.includes(channel.channel_id);
    });

    if (openChannels.length > 0) {
      setPaymentConfirmed(true);
      showSuccessBanner({
        message: 'Channel opened successfully',
      });
    } else {
      showWarningBanner({
        message: 'Channel open is still pending',
      });
    }
  };

  const estimateFees = async () => {
    try {
      await fetch(VOLTAGE_LSP_FEE_ESTIMATE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_msat: parseInt(requestLiquidity, 10) * 1000, // get amount in msats
          pubkey: '025804d4431ad05b06a1a1ee41f22fefeb8ce800b0be3a92ff3b9f594a263da34e',
        }),
      })
        .then((fees) => fees.json())
        .then((data) => {
          const feeInSats = data.fee_amount_msat / 1000; // get fee in sats from msats
          setWrappedInvoiceFees(feeInSats);
          console.log('fee api', data);
        })
        .catch((error) => {
          showWarningBanner({
            message: error.message,
          });
        });
      setIsLoading(false);
    } catch (e) {
      // console.error(e.message);
      showWarningBanner({
        message: e.message,
      });
    }
  };

  useEffect(() => {
    getWrappedInvoice();
    // estimate fees if fee estimate is zero.
    if (wrappedInvoiceFees === 0) {
      estimateFees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestLiquidity, nodeInvoice]);

  const edges: Edge[] | undefined = ['bottom'];

  const DynamicButton = () => {
    const ctaButtonTitle = paymentConfirmed ? 'Continue' : 'Confirm channel open';
    const ctaAction = paymentConfirmed ? onPressContinue : confirmChannelOpen;
    return (
      <Button
        title={ctaButtonTitle}
        onPress={ctaAction}
        style={styles.button}
        size="default"
        disabled={isLoading || wrappedInvoice === undefined}
      />
    );
  };

  const totalChannelCapacity = parseInt(requestLiquidity, 10) * 2;
  const channelReserve = totalChannelCapacity * 0.01; // 1% of total capacity
  const receiveAmount = parseInt(requestLiquidity, 10);
  const canReceive = parseInt(requestLiquidity, 10) - channelReserve;
  const totalInvoiceAmount = parseInt(requestLiquidity, 10) + wrappedInvoiceFees;

  return (
    <SafeAreaView style={styles.container} edges={edges}>
      <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <InfoListItem title="Total capacity" value={totalChannelCapacity} valueIsNumeric={true} />
          <InfoListItem title="Can send" value={canReceive} valueIsNumeric={true} />
          <InfoListItem title="Can receive" value={canReceive} valueIsNumeric={true} />
          <InfoListItem title="Channel reserve" value={channelReserve} valueIsNumeric={true} />
          <InfoListItem
            title="Invoice amount"
            value={receiveAmount}
            valueIsNumeric={true}
            highlightValue={true}
          />
          <InfoListItem
            title="LSP fees"
            value={wrappedInvoiceFees}
            valueIsNumeric={true}
            highlightValue={true}
          />
        </View>
        <View style={styles.qrContainer}>
          {isLoading || wrappedInvoice === undefined ? (
            <ActivityIndicator color={Colors.orange.base} />
          ) : (
            <>
              <QRCode
                value={`lightning:${wrappedInvoice}`}
                size={QR_CODE_WIDTH}
                backgroundColor={Colors.common.white}
                color={Colors.common.black}
              />
              <InvoiceActionsBar
                paymentRequest={wrappedInvoice}
                allowModifier={false}
                smallButtons={true}
              />
              {!paymentConfirmed ? (
                <>
                  <ActivityIndicator color={Colors.orange.base} />
                  <Text
                    style={[
                      styles.total,
                      paymentConfirmed
                        ? { color: Colors.green.base }
                        : { color: Colors.orange.base },
                    ]}
                  >
                    Pending for channel open: {totalInvoiceAmount} sats.
                  </Text>
                </>
              ) : (
                <Text
                  style={[
                    styles.total,
                    paymentConfirmed ? { color: Colors.green.base } : { color: Colors.orange.base },
                  ]}
                >
                  Channel opened successfully
                </Text>
              )}
            </>
          )}
        </View>
        <DynamicButton />
        <KeyboardSpacer topSpacing={16} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

JITLiquidityScreen.navigationOptions = initOnboardingNavigationOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  contentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  infoContainer: {
    flex: 1,
    marginBottom: 10,
  },
  qrContainer: {
    flex: 1,
    alignItems: 'center',
  },
  intro: {
    ...TypographyPresets.Header4,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  amountContainer: {
    paddingBottom: 24,
    flex: 1,
  },
  button: {
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  adviceWrapper: {
    paddingBottom: 24,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  adviceText: {
    color: Colors.neutrals.light.neutral6,
    textAlign: 'center',
  },
  fees: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral6,
    paddingVertical: 10,
  },
  total: {
    ...TypographyPresets.Body4,
    paddingVertical: 10,
    textAlign: 'center',
  },
});

export default JITLiquidityScreen;
