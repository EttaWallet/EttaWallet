import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, StyleSheet, View, Platform, ActivityIndicator } from 'react-native';
import { headerWithCloseButton } from '../navigation/Headers';
import { createLightningInvoice, startLightning } from '../utils/lightning/helpers';
import { isLdkRunning, waitForLdk } from '../ldk';

const ReceiveScreen = () => {
  const [invoice, setInvoice] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const amount = 1000;
  const message = 'vibes and inshallah';

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const isLdkUp = await isLdkRunning();
        if (!isLdkUp) {
          await startLightning({});
        }
        await waitForLdk();
        const invoiceString = await createLightningInvoice({
          amountSats: amount,
          description: message,
          expiryDeltaSeconds: 3600,
        });

        if (invoiceString.isErr()) {
          console.log(invoiceString.error.message);
          return;
        }
        setIsLoading(false);
        setInvoice(invoiceString.value.to_str);
      } catch (e) {
        setInvoice(`Error: ${e.message}`);
      }
    }

    fetchInvoice();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.messageContainer}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.text}>
            {typeof invoice === 'string' ? invoice : JSON.stringify(invoice)}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

ReceiveScreen.navigationOptions = {
  ...headerWithCloseButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    minHeight: 120,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

export default ReceiveScreen;
