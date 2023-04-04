import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from 'etta-ui';
import { useStoreState, useStoreActions } from '../state/hooks';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

const DisconnectBanner = () => {
  const { t } = useTranslation();

  const [hasAppConnected, setHasAppConnected] = React.useState(false);

  // Use the Easy Peasy hook to access the appConnected state
  const isAppConnected = useStoreState((state) => state.internet.isConnected);
  const checkConnectionStatus = useStoreActions(
    (actions) => actions.internet.checkConnectionStatus
  );

  React.useEffect(() => {
    let unsubscribe;
    checkConnectionStatus().then((fn) => {
      unsubscribe = fn;
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [checkConnectionStatus]);

  React.useEffect(() => {
    setHasAppConnected(isAppConnected);
  }, [isAppConnected]);

  if (hasAppConnected) {
    return null;
  }

  // App's not connected anymore, show not connected animation
  if (!hasAppConnected) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <LottieView
          style={{ width: '10%', aspectRatio: 1 }}
          source={require('../../assets/lottie/no-connection.json')}
          autoPlay
          loop
        />
        <Text style={{ paddingLeft: 10 }}>{t('disconnected')}</Text>
      </View>
    );
  }

  // App is connecting for first time, show grey banner
  return (
    <View>
      <ActivityIndicator size="small" color={Colors.orange.base} />
    </View>
  );
};

export default DisconnectBanner;
