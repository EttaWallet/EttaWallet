import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import { navigateHome } from '../navigation/NavigationService';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { sleep } from '../utils/helpers';
import { InfoListItem } from '../components/InfoListItem';
import { TChannel } from '@synonymdev/react-native-ldk';
import {
  addPeers,
  createLightningInvoice,
  decodeLightningInvoice,
  getLightningChannels,
  getLightningStore,
  hasOpenLightningChannels,
  payInvoiceWithFaucet,
  startLightning,
} from '../utils/lightning/helpers';
import { CHANNEL_OPEN_DEPOSIT_SATS, LSP_PUBKEY } from '../../config';
import { isLdkRunning, waitForLdk } from '../ldk';
import { showErrorBanner, showInfoBanner } from '../utils/alerts';
import base64Utils from '../utils/base64';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ChannelStatusScreen>;

export function ChannelStatusScreen(props: RouteProps) {
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Opening a channel" />,
    });
  }, [props.navigation]);

  const [isLoading, setIsLoading] = useState({
    check: true,
    generate: false,
    pay: false,
  });
  const [isSuccess, setIsSuccess] = useState({
    check: false,
    generate: false,
    pay: false,
  });
  const [errors, setErrors] = useState({
    check: null,
    generate: null,
    pay: null,
  });

  const updateIsLoading = (key, value) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };

  const updateIsSuccess = (key, value) => {
    setIsSuccess((prev) => ({ ...prev, [key]: value }));
  };

  const updateErrors = (key, value) => {
    setErrors((prev) => ({ ...prev, [key]: value }));
  };

  function useIsMounted() {
    const isMountedRef = useRef(false);

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    return isMountedRef; // return the ref, not just its current value
  }

  const [invoice, setInvoice] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [channel, setChannel] = useState<TChannel>();
  const [isRetryNeeded, setRetryNeeded] = useState(false);

  const isMountedRef = useIsMounted();

  const payLSPInvoice = async ({ bolt11 }: { bolt11: string }) => {
    updateIsLoading('pay', true);
    // Start a timer to check the state store for channels every 1 second
    // since payment might come through at any time.
    const intervalId = setInterval(async () => {
      const checkChannelsRes = await getLightningChannels();
      if (checkChannelsRes.isOk() && checkChannelsRes.value.length > 0) {
        setChannel(checkChannelsRes.value[0]);
        console.log('channel: ', channel);
        clearInterval(intervalId); // Clear the timer when the channels object is found
      }
    }, 1000);
    try {
      const payResponse = await payInvoiceWithFaucet({
        // pass the new invoice
        bolt11: bolt11.toString(),
      });
      clearInterval(intervalId);
      if (payResponse.payment_error) {
        updateIsLoading('pay', false);
        updateIsSuccess('pay', false);
        updateErrors('pay', payResponse.payment_error || 'Error paying invoice');
        setRetryNeeded(true);
      } else {
        const payment_hash = base64Utils.base64ToHex(payResponse.payment_hash);
        setPaymentId(payment_hash);
        updateIsSuccess('pay', true);
        updateIsLoading('pay', false);
      }
    } catch (error) {
      clearInterval(intervalId);
      updateIsLoading('pay', false);
      updateIsSuccess('pay', false);
      updateErrors('pay', error.message || 'Error paying invoice');
      setRetryNeeded(true);
    }
  };

  const startChannelOpen = async () => {
    try {
      // ensure Ldk is up
      const isLdkUp = await isLdkRunning();
      if (!isLdkUp) {
        await startLightning({});
      }
      await waitForLdk();
      await addPeers();
      updateIsSuccess('check', true);
      updateIsLoading('check', false);
      if (!hasOpenLightningChannels() && isMountedRef.current) {
        updateIsLoading('generate', true);
        try {
          const invoiceRes = await createLightningInvoice({
            amountSats: CHANNEL_OPEN_DEPOSIT_SATS,
            description: '',
            expiryDeltaSeconds: 3600,
          });
          if (invoiceRes.isOk()) {
            // lsp would have updated the bolt11 but payment_hash will match.
            // this finds the new invoice object
            await sleep(3000);
            const invoiceStore = getLightningStore().invoices;
            // this complex function will always return an invoice, either from the LSP
            // or from the mobile node. 'generate' needs to fail in the event that the mobile node
            // returns the invoice instead of the LSP
            const newInvoice = invoiceStore.filter(
              (inv) => inv.payment_hash === invoiceRes.value.payment_hash
            );
            if (newInvoice.length > 0) {
              const decodeResponse = await decodeLightningInvoice({
                paymentRequest: newInvoice[0].to_str,
              });
              if (decodeResponse.isErr()) {
                return;
              }
              if (decodeResponse.value.payee_pub_key === LSP_PUBKEY) {
                setInvoice(decodeResponse.value.to_str);
                updateIsSuccess('generate', true);
                updateIsLoading('generate', false);
                await sleep(3000);
                if (isMountedRef.current) {
                  await payLSPInvoice({ bolt11: decodeResponse.value.to_str });
                }
              }
            } else {
              updateIsLoading('generate', false);
              setRetryNeeded(true);
              updateErrors('generate', 'Error getting wrapped invoice');
              updateIsSuccess('generate', false);
            }
          }
        } catch (error) {
          updateIsLoading('generate', false);
          setRetryNeeded(true);
          updateErrors('generate', 'Error getting modified wrapped invoice');
          updateIsSuccess('generate', false);
        }
      } else {
        // do something here. maybe show a card with channel stats and activate the proceed to wallet button
        showInfoBanner({
          message: 'You already have a channel',
        });
        await sleep(2000);
        navigateHome();
      }
    } catch (error) {
      setRetryNeeded(true);
      showErrorBanner({
        message: error.message,
      });
    }
  };

  useEffect(() => {
    startChannelOpen();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderEvent = (label, stateKey) => (
    <View style={styles.section}>
      {isLoading[stateKey] ? (
        <View style={styles.pendingContainer}>
          <ActivityIndicator color={Colors.orange.light} size="small" />
        </View>
      ) : isSuccess[stateKey] ? (
        <View style={styles.sectionIconContainer}>
          <Icon name="icon-check" style={[styles.sectionIcon, { color: Colors.green.light }]} />
        </View>
      ) : isLoading[stateKey] === false && isSuccess[stateKey] === false ? (
        <View style={styles.sectionIconContainer}>
          <Icon
            name="icon-ellipsis"
            style={[styles.sectionIcon, { color: Colors.neutrals.light.neutral7 }]}
          />
        </View>
      ) : (
        <View style={styles.sectionIconContainer}>
          <Icon name="icon-cross" style={[styles.sectionIcon, { color: Colors.red.light }]} />
        </View>
      )}
      <Text style={styles.sectionText}>{label}</Text>
    </View>
  );

  const handleRetry = () => {
    setRetryNeeded(false);
    startChannelOpen();
  };

  return (
    <SafeAreaView style={styles.safeAreaView} edges={['bottom']}>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.eventContainer}>
          {renderEvent('Spinning up lightning node ...', 'check')}
          {errors.check && <Text style={styles.errorText}>{errors.check}</Text>}
        </View>
        <View style={styles.eventContainer}>
          {renderEvent('Generating invoice ...', 'generate')}
          {invoice && (
            <InfoListItem
              title="Invoice from LSP"
              value={invoice}
              maskValue={true}
              canCopy={true}
            />
          )}
          {errors.generate && <Text style={styles.errorText}>{errors.generate}</Text>}
        </View>
        <View style={styles.eventContainer}>
          {channel && (
            <>
              <InfoListItem
                title="New channel"
                value={channel?.channel_id}
                maskValue={true}
                canCopy={true}
              />
              <InfoListItem
                title="Total capacity"
                value={channel?.channel_value_satoshis.toLocaleString()}
                valueIsNumeric={true}
              />
              <InfoListItem
                title="Funding transaction"
                value={channel?.funding_txid}
                maskValue={true}
                canCopy={true}
              />
            </>
          )}
        </View>
        <View style={styles.eventContainer}>
          {renderEvent(channel ? 'Waiting for confirmation ...' : 'Paying invoice ...', 'pay')}
          {channel && (
            <Text style={styles.warningText}>This might take a few minutes. Hang on ...</Text>
          )}
          {paymentId && (
            <InfoListItem
              title="Transaction ref"
              value={paymentId}
              maskValue={true}
              canCopy={true}
            />
          )}
          {errors.pay && <Text style={styles.errorText}>{errors.pay}</Text>}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        {isRetryNeeded && (
          <Button title="Retry" onPress={handleRetry} style={styles.button} appearance="outline" />
        )}
        <Button
          title="Proceed to wallet"
          onPress={() => navigateHome()}
          style={styles.button}
          disabled={!channel}
        />
      </View>
    </SafeAreaView>
  );
}

ChannelStatusScreen.navigationOptions = () => ({
  ...headerWithBackButton,
});

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flexGrow: 1,
  },
  eventContainer: {
    flexDirection: 'column',
  },
  infoContainer: {
    flex: 1,
    marginTop: 16,
  },
  text: {
    ...TypographyPresets.Header4,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    justifyContent: 'center',
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  errorIconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: Colors.red.base,
    marginBottom: 20,
  },
  lottieIcon: {
    width: '40%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  navIconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: Colors.neutrals.light.neutral3,
  },
  helpNavIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.black,
  },
  section: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginVertical: 5,
  },
  sectionText: {
    ...TypographyPresets.Body4,
    flex: 1,
    flexGrow: 1,
    alignSelf: 'center',
  },
  closeIcon: {
    fontSize: 20,
  },
  sectionIcon: {
    fontSize: 24,
  },
  sectionIconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: Colors.neutrals.light.neutral1,
    marginRight: 12,
  },
  pendingContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 157, 0, 0.1)',
    marginRight: 12,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.light.neutral2,
  },
  statusText: {
    ...TypographyPresets.Body5,
    color: Colors.common.black,
    marginHorizontal: 12,
  },
  errorText: {
    ...TypographyPresets.Body5,
    color: Colors.red.base,
  },
  warningText: {
    ...TypographyPresets.Body5,
    color: Colors.orange.base,
  },
});

export default ChannelStatusScreen;
