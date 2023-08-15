import { Colors, TypographyPresets } from 'etta-ui';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

type ContainerProps = {
  words: string[];
};

const Capsule = ({ index, word }) => {
  // some words are really long and might break the capsule. This is an attempt
  // to resolve this.
  const [fontSize, setFontSize] = useState(TypographyPresets.Body4.fontSize);

  useEffect(() => {
    // Calculate the maximum width for the text
    const maxWidth = Dimensions.get('window').width * 0.45 * 0.8; // 45% capsule width * 80% max text width
    const adjustedFontSize = maxWidth / word.length; // Calculate the font size based on text length

    setFontSize(Math.min(14, adjustedFontSize)); // Set the font size, but not larger than the default size
  }, [word]);

  return (
    <View key={index} style={styles.phraseContainer}>
      <View style={styles.indexContainer}>
        <Text style={styles.index}>{index + 1}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.wordContainer}>
        <Text key={index} style={[styles.word, { fontSize }]}>
          {word}
        </Text>
      </View>
    </View>
  );
};

const RecoveryPhraseContainer = ({ words }: ContainerProps) => {
  return (
    <View style={styles.container}>
      {words.map((word, index) => (
        <Capsule key={index} index={index + 1} word={word} />
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
    flexDirection: 'row',
    backgroundColor: Colors.neutrals.light.neutral3,
    borderRadius: 25,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    margin: '2.5%',
  },
  indexContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  index: {
    ...TypographyPresets.Header5,
    color: Colors.common.black,
  },
  wordContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  word: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
    alignItems: 'center',
    paddingVertical: 8,
    maxWidth: '80%',
  },
  border: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.common.white,
  },
});

export default RecoveryPhraseContainer;
