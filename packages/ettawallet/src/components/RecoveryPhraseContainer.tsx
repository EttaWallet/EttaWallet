import * as React from 'react';
import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

export enum RecoveryPhraseContainerMode {
  READONLY = 'READONLY',
  INPUT = 'INPUT',
}

export enum RecoveryPhraseType {
  BACKUP_KEY = 'BACKUP_KEY',
}

type Props = {
  value: string | null;
  mode: RecoveryPhraseContainerMode;
  type: RecoveryPhraseType;
  index?: number; // e.g. index of safeguard phrase
  showCopy?: boolean;
  style?: ViewStyle;
  onChangeText?: (value: string) => void;
  includeHeader?: boolean;
};

export class RecoveryPhraseContainer extends React.Component<Props> {
  onPhraseInputChange = (value: string) => {
    if (this.props.onChangeText) {
      this.props.onChangeText(value);
    }
  };

  render() {
    const { value: words, style, mode, type, includeHeader } = this.props;

    return (
      <View style={style}>
        <View style={styles.headerContainer}>
          {type === RecoveryPhraseType.BACKUP_KEY && includeHeader !== false && (
            <View style={styles.writeDownKeyContainer}>
              <Text style={styles.writeDownKey}>Your recovery phrase</Text>
            </View>
          )}
        </View>
        {mode === RecoveryPhraseContainerMode.READONLY && (
          <View style={styles.phraseContainer}>
            {!!words && <Text style={styles.phraseText}>{words}</Text>}
          </View>
        )}
        {mode === RecoveryPhraseContainerMode.INPUT && (
          <View style={styles.phraseInputContainer}>
            <TextInput
              style={[styles.phraseInputText]}
              value={words || ''}
              placeholder="Seed or Recovery Phrase"
              onChangeText={this.onPhraseInputChange}
              underlineColorAndroid="transparent"
              placeholderTextColor={colors.gray4}
              enablesReturnKeyAutomatically={true}
              multiline={true}
              autoCorrect={false}
              autoCapitalize={'none'}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  headerButton: {
    ...fontStyles.regular,
  },
  writeDownKeyContainer: {
    flexDirection: 'column',
  },
  writeDownKey: {
    ...fontStyles.h2,
    marginBottom: 16,
  },
  phraseContainer: {
    marginTop: 8,
    backgroundColor: colors.beige,
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 4,
    alignContent: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  phraseText: {
    ...fontStyles.regular,
    fontSize: 22,
    lineHeight: 32,
  },
  phraseInputContainer: {
    marginTop: 10,
  },
  phraseInputText: {
    ...fontStyles.regular,
    minHeight: 125,
    padding: 14,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
});

export default RecoveryPhraseContainer;
