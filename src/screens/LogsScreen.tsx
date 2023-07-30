import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../navigation/Headers';
import RNFS from 'react-native-fs';
import lm from '@synonymdev/react-native-ldk';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native-gesture-handler';

const LogsScreen = ({ navigation }) => {
  const [logContent, setLogContent] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Node logs" />,
      headerRight: () => <Button onPress={() => 0} title="Export" appearance="transparent" />,
    });
  }, [navigation]);

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={logContent}
        renderItem={({ item }) => <Text style={styles.text}>{logContent}</Text>}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={<Text>No logs available</Text>}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexGrow: 1,
  },
  text: {
    color: Colors.common.black,
    ...TypographyPresets.Body5,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 20,
  },
  button: {
    justifyContent: 'center',
  },
});

export default LogsScreen;
