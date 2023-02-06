import React from 'react';
import { Text, View, SafeAreaView } from 'react-native';
import { Button, TypographyPresets } from 'etta-ui';

export const ErrorScreen = () => {
  return (
    <SafeAreaView>
      <View style={{ marginHorizontal: 16 }}>
        <Text style={{ ...TypographyPresets.Header2, textAlign: 'center' }}>
          Ooops. Something went wrong
        </Text>
        <Button title="Restart" appearance="filled" size="block" />
      </View>
    </SafeAreaView>
  );
};
