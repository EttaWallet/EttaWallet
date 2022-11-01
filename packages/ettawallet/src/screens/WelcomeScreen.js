import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Button } from '@ettawallet/react-native-kit';
import { View, StyleSheet } from 'react-native';
import { BitcoinCircle } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { navigate } from '../navigation/NavigationService';

const WelcomeScreen = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <BitcoinCircle
        style={{ alignSelf: 'center', marginTop: 50 }}
        width={100}
        height={100}
        color="#F7931A"
      />
      <Text
        style={{ textAlign: 'center', marginBottom: 10 }}
        typography="h1"
        fontWeight="bold"
        fontColor="dark"
      >
        EttaWallet
      </Text>
      <Text
        style={styles.text}
        typography="h5"
        fontWeight="light"
        fontColor="dark"
      >
        {t('welcome.subtitle')}
      </Text>
      <Button
        style={styles.button}
        color="primary"
        variant="filled"
        tone="orange"
        onPress={() => navigate('SetPin')}
      >
        <Text fontWeight="normal" fontColor="light">
          {t('welcome.createNewWallet')}
        </Text>
      </Button>
      <Button
        style={styles.button}
        color="primary"
        variant="text"
        tone="orange"
        onPress={() => navigate('RestoreWallet')}
      >
        <Text fontWeight="normal" fontColor="orange">
          {t('welcome.restoreWallet')}
        </Text>
      </Button>
      <Text style={styles.footer} fontWeight="light">
        {t('welcome.footer')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 20,
    color: 'gray',
  },
  button: {
    marginBottom: 10,
  },
  footer: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 'auto',
  },
});

export default WelcomeScreen;
