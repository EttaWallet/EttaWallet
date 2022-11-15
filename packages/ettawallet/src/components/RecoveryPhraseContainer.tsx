import * as React from 'react';

import { WithTranslation } from 'react-i18next';
import { withTranslation } from '../../i18n';
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
} & WithTranslation;

export class RecoveryPhraseContainer extends React.Component<Props> {
  onPhraseInputChange = (value: string) => {
    if (this.props.onChangeText) {
      this.props.onChangeText(value);
    }
  };

  render() {
    const { t, value: words, style, mode, type, includeHeader } = this.props;

    return (
      <View style={style}>
        <View style={styles.headerContainer}>
          {type === RecoveryPhraseType.BACKUP_KEY && includeHeader !== false && (
            <View style={styles.writeDownKeyContainer}>
              <Text style={styles.writeDownKey}>
                {t('manualBackup.inputHeader')}
              </Text>
            </View>
          )}
        </View>
        {mode === RecoveryPhraseContainerMode.READONLY && (
          /* @TODO: Convert this container into a well number list of words in 2 columns and 6 rows */
          <View style={styles.phraseContainer}>
            {!!words && (
              <>
                <Text>{words.length}</Text>
                <Text style={styles.phraseText}>{words}</Text>
              </>
            )}
          </View>
        )}
        {mode === RecoveryPhraseContainerMode.INPUT && (
          <View style={styles.phraseInputContainer}>
            <TextInput
              style={[styles.phraseInputText]}
              value={words || ''}
              placeholder={t('manualBackup.inputPlaceholder')}
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

export default withTranslation<Props>()(RecoveryPhraseContainer);
