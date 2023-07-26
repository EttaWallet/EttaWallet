import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Platform, View } from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import RNFS from 'react-native-fs';
import lm from 'rn-ldk';
import { Colors, TypographyPresets } from 'etta-ui';
import { SafeAreaView } from 'react-native-safe-area-context';

const LogsScreen = () => {
  const [logContent, setLogContent] = useState('');

  useEffect(() => {
    const readLogStream = async () => {
      if (!lm.logFilePath) {
        console.log('no ldk logs found');
        return;
      }
      try {
        const content = await RNFS.readFile(lm.logFilePath, 'utf8');
        const lines = content.split('\n');
        const reversedContent = lines.reverse().join('\n');
        setLogContent(reversedContent);
      } catch (e) {
        console.log(JSON.stringify(e));
      }
    };

    const intervalId = setInterval(readLogStream, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.text}>{logContent}</Text>
      </View>
    </SafeAreaView>
  );
};

LogsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.common.black,
  },
  text: {
    color: Colors.common.white,
    ...TypographyPresets.Body5,
  },
});

export default LogsScreen;
