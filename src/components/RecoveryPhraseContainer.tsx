import { Colors, TypographyPresets } from 'etta-ui';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ContainerProps = {
  words: string[];
};

const RecoveryPhraseContainer = ({ words }: ContainerProps) => {
  return (
    <View style={styles.container}>
      {words.map((word, index) => (
        <View key={index} style={styles.phraseContainer}>
          <View style={styles.indexContainer}>
            <Text style={styles.index}>{index + 1}</Text>
          </View>
          <Text key={index} style={styles.word}>
            {word}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  phraseContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '30%',
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal: '3%',
    backgroundColor: Colors.neutrals.light.neutral3,
    borderRadius: 100,
    alignItems: 'center',
  },
  indexContainer: {
    borderRightWidth: 2,
    borderRightColor: Colors.common.white,
  },
  index: {
    ...TypographyPresets.Header5,
    color: Colors.common.black,
    padding: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  word: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
    paddingLeft: 8,
    alignItems: 'center',
  },
});

export default RecoveryPhraseContainer;
