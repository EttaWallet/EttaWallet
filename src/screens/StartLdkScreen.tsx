/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { noHeader } from '../navigation/Headers';
import { navigate } from '../navigation/NavigationService';
import LottieView from 'lottie-react-native';
import { NodeState } from '../utils/types';
import { Button, Colors, Icon, TypographyPresets } from 'etta-ui';
import { useStoreActions, useStoreState } from '../state/hooks';
import { cueInformativeHaptic, cueSuccessHaptic } from '../utils/accessibility/haptics';
import { restartApp } from '../utils/restart';
import { showErrorBanner } from '../utils/alerts';
import { sleep } from '../utils/helpers';
import { verticalScale } from '../utils/sizing';
import { Screens } from '../navigation/Screens';
import { createPaymentRequest, hasOpenLightningChannels } from '../utils/lightning/helpers';
import { Result, ok } from '../utils/result';
import { LSP_API } from '../../config';

export function StartLdkScreen() {
  const ldkState = useStoreState((state) => state.lightning.ldkState);
  const nodeStarted = useStoreState((state) => state.lightning.nodeStarted);
  const nodeId = useStoreState((state) => state.lightning.nodeId);
  const startNode = useStoreActions((actions) => actions.lightning.startLdk);
  const setLdkState = useStoreActions((actions) => actions.lightning.setLdkState);
  const [giftinvoice, setGiftInvoice] = useState('');
  const [errorFound, setErrorFound] = useState<string | null>(null);

  const handleApiErrors = (errorMessage: string) => {
    setErrorFound(errorMessage);
  };

  /**
   * Attempts to open a free lightning channel
   * @returns {string}
   */
  const payGiftInvoice = async (): Promise<Result<string>> => {
    if (!giftinvoice) {
      showErrorBanner({
        message: 'Gift invoice not found',
      });
      return;
    }
    const attemptGiftPayment = await fetch(`${LSP_API}/pay`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bolt_11: giftinvoice,
      }),
    });

    if (attemptGiftPayment.ok) {
      const payResponse = await attemptGiftPayment.json();
      if (payResponse.confirmed_at) {
        console.log(`Gift invoice paid successfully at ${payResponse.confirmed_at}`);
      }
    } else {
      const errorMsg = await attemptGiftPayment.text();
      handleApiErrors(errorMsg);
    }

    return ok('Gift is en-route...');
  };

  const onPressStart = useCallback(() => {
    cueInformativeHaptic();
    if (!nodeStarted) {
      startNode();
    } else {
      cueSuccessHaptic();
    }
    // return;
  }, [nodeStarted]);

  const onPressRetry = useCallback(() => {
    setLdkState(NodeState.OFFLINE);
    cueInformativeHaptic();
    if (!nodeStarted) {
      startNode();
    } else {
      cueSuccessHaptic();
    }
    // return;
  }, [nodeStarted]);

  useEffect(() => {
    if (!nodeStarted) {
      startNode();
    }
    cueSuccessHaptic();
  }, [nodeStarted]);

  useEffect(() => {
    // /**
    //  * Attempts to open a free lightning channel
    //  * @returns {TChannel}
    //  */
    // const openFreeLightningChannel = async (): Promise<Result<TChannel>> => {
    //   try {
    //     const InvoiceRes = await createPaymentRequest({
    //       amountSats: 5000,
    //       description: 'Welcome to the lightning network',
    //       expiryDeltaSeconds: 3600,
    //     });
    //     if (InvoiceRes.isErr()) {
    //       console.log(InvoiceRes.error.message);
    //       return;
    //     }
    //     if (InvoiceRes.isOk()) {
    //       const LspChannelRequest = await fetch(`${LSP_API}/proposal`, {
    //         method: 'POST',
    //         headers: {
    //           Accept: 'application/json',
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //           bolt11: InvoiceRes.value.to_str,
    //         }),
    //       });

    //       let channelTx: string;
    //       let freshChannel: TChannel;
    //       if (LspChannelRequest.ok) {
    //         const openChannelRes = await freeChannelOpen.json();
    //         if (openChannelRes) {
    //           channelTx = openChannelRes.transaction_id;
    //           freshChannel = channels.filter((ch) => ch.funding_txid === channelTx)[0];

    //           return ok(freshChannel);
    //         }
    //       } else {
    //         const errorMsg = await freeChannelOpen.text();
    //         handleApiErrors(errorMsg);
    //       }
    //     }
    //   } catch (error: any) {
    //     console.error(error.message);
    //   }
    // };
    // check that node started and for the existence of least one open channel, if none open a free channel.
    if (nodeStarted && !hasOpenLightningChannels()) {
      console.log('node is ready: ');
    }
  }, [nodeStarted]);

  const onPressProceed = async () => {
    cueInformativeHaptic();
    // create first invoice for this fresh node
    const InvoiceRes = await createPaymentRequest({
      amountSats: 5000,
      description: 'Welcome to the lightning network',
      expiryDeltaSeconds: 3600,
    });
    if (InvoiceRes.isErr()) {
      console.log(InvoiceRes.error.message);
      return;
    }
    if (InvoiceRes.isOk()) {
      setGiftInvoice(InvoiceRes.value.to_str);
      await sleep(2000);
      await payGiftInvoice();
      navigate(Screens.WalletHomeScreen);
    }
  };

  const update = useMemo(() => {
    switch (ldkState) {
      case NodeState.ERROR:
        return null;
      case NodeState.START:
        return 'Getting things ready ...';
      case NodeState.COMPLETE:
        return 'All set';
      default:
        return null;
    }
  }, [ldkState]);

  const actionButtons = useMemo(() => {
    switch (ldkState) {
      case NodeState.OFFLINE:
        return (
          <View style={styles.buttonContainer}>
            <Button title="Start" onPress={onPressStart} style={styles.button} />
          </View>
        );
      case NodeState.ERROR:
        return (
          <View style={styles.buttonContainer}>
            <Button title="Try again" onPress={onPressRetry} style={styles.button} />
            <Button
              title="Restart EttaWallet"
              onPress={restartApp}
              appearance="outline"
              style={styles.button}
            />
          </View>
        );
      case NodeState.START:
        return (
          <View style={styles.buttonContainer}>
            <Button
              title="Proceed to wallet"
              onPress={onPressProceed}
              appearance="filled"
              style={styles.button}
              disabled={!nodeStarted}
            />
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <View style={styles.buttonContainer}>
            <Button
              title="Proceed to wallet"
              onPress={onPressProceed}
              appearance="filled"
              style={styles.button}
            />
          </View>
        );
      default:
        return null;
    }
  }, [ldkState]);

  const stateDisplay = useMemo(() => {
    switch (ldkState) {
      default:
      case NodeState.OFFLINE:
        return (
          <>
            <Text style={styles.text}>Start your lightning node</Text>
            <Text style={styles.subText}>Send and receive instant payments ...</Text>
          </>
        );
      case NodeState.START:
        return (
          <View style={styles.section}>
            <Text style={styles.sectionText}>{update}</Text>
            {errorFound !== null ? <Text style={styles.sectionText}>{errorFound}</Text> : null}
          </View>
        );
      case NodeState.ERROR:
        return (
          <View>
            <Text style={styles.text}>Couldn't start your node</Text>
            <Text style={styles.subText}>
              This could happen for any number of reasons. Please try again
            </Text>
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <>
            <Text style={styles.text}>All set!</Text>
            <Text style={styles.subText}>Welcome to the Lightning Network</Text>
          </>
        );
    }
  }, [ldkState, nodeId]);

  const stateIcon = useMemo(() => {
    switch (ldkState) {
      default:
      case NodeState.OFFLINE:
        return (
          <View style={styles.iconContainer}>
            <Icon name="icon-lightning" style={styles.icon} />
          </View>
        );
      case NodeState.START:
        return (
          <View style={styles.lottieContainer}>
            <LottieView
              style={[styles.lottieIcon, { width: '80%' }]}
              source={require('../../assets/lottie/starting.json')}
              autoPlay={true}
              loop={true}
            />
          </View>
        );
      case NodeState.ERROR:
        return (
          <View style={styles.errorIconContainer}>
            <Icon name="icon-alert" style={styles.icon} />
          </View>
        );
      case NodeState.COMPLETE:
        return (
          <LottieView
            style={[styles.lottieIcon, { width: '50%' }]}
            source={require('../../assets/lottie/success-check.json')}
            autoPlay={true}
            loop={false}
          />
        );
    }
  }, [ldkState]);

  // Prevent back button on Android
  useEffect(() => {
    const backPressListener = () => true;
    BackHandler.addEventListener('hardwareBackPress', backPressListener);
    return () => BackHandler.removeEventListener('hardwareBackPress', backPressListener);
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaView} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View>{stateIcon}</View>
        {stateDisplay}
      </ScrollView>
      {actionButtons}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    marginBottom: verticalScale(24),
  },
  contentContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  text: {
    ...TypographyPresets.Header4,
    textAlign: 'center',
  },
  subText: {
    ...TypographyPresets.Body4,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  button: {
    marginBottom: 16,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    paddingHorizontal: 32,
  },
  icon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 52,
    color: Colors.common.white,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: Colors.purple.base,
    marginBottom: 20,
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
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieIcon: {
    aspectRatio: 1,
  },
  nodeIdBox: {
    borderRadius: 4,
    backgroundColor: Colors.neutrals.light.neutral3,
    padding: 16,
    marginTop: 24,
  },
  nodeId: {
    textAlign: 'center',
  },
  copy: {
    ...TypographyPresets.Body5,
    paddingTop: 10,
    textDecorationLine: 'underline',
    color: Colors.neutrals.light.neutral7,
    textAlign: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    ...TypographyPresets.Body4,
  },
  closeIcon: {
    fontSize: 20,
  },
  sectionIcon: {
    fontSize: 24,
    color: Colors.green.base,
  },
  sectionIconContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    marginRight: 12,
  },
  pendingContainer: {
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 157, 0, 0.1)',
    marginRight: 5,
  },
});

StartLdkScreen.navOptions = {
  ...noHeader,
  // Prevent swiping back on iOS
  gestureEnabled: false,
};

export default StartLdkScreen;
