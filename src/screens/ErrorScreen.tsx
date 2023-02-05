import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'etta-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18nContext } from '@src/i18n/i18n-react';

export const ErrorScreen = () => {
  const { LL } = useI18nContext();

  return (
    <SafeAreaView>
      <View>
        <Text>{LL.welcome.subtitle()}</Text>
        <Button title="Restart" appearance="filled" size="block" />
      </View>
    </SafeAreaView>
  );
};
