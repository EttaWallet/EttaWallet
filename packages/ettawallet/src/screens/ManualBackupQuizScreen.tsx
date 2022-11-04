/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react';
import { Trans, WithTranslation } from 'react-i18next';
import { chunk, flatMap, shuffle, times } from 'lodash';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TextButton from '../components/TextButton';
import Touchable from '../components/Touchable';
import i18n, { withTranslation } from '../../i18n';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';
import Logger from '../utils/logger';
import { Mode } from '../utils/types';
import { onGetMnemonicFail } from '../utils/backup';
import { EttaStorageContext } from '../../storage/context';
import Backspace from '../icons/Backspace';
import QuizChecker from '../components/QuizChecker';
import { navigate } from '../navigation/NavigationService';
import { emptyHeader } from '../navigation/headers/Headers';
import CancelConfirm from '../components/CancelConfirm';

const TAG = 'backup/ManualBackupQuiz';

const MNEMONIC_BUTTONS_TO_DISPLAY = 4;

// miliseconds to wait until showing success or failure
const CHECKING_DURATION = 1.8 * 1000;

interface State {
  mode: Mode;
  mnemonic: string;
  mnemonicLength: number;
  mnemonicWords: string[];
  userChosenWords: Array<{
    word: string;
    index: number;
  }>;
}

interface StateProps {
  account: string | null;
  navigation: any;
  showError: any;
}

type Props = WithTranslation & StateProps;

export const navOptionsForQuiz = () => {
  const onCancel = () => {
    navigate('Settings');
  };
  return {
    ...emptyHeader,
    headerLeft: () => {
      return <CancelConfirm screen={TAG} />;
    },
    headerTitle: i18n.t(`manualBackupQuiz.headerTitle`),
  };
};

export class ManualBackupQuiz extends React.Component<Props, State> {
  state: State = {
    mnemonic: '',
    mnemonicLength: 0,
    mnemonicWords: [],
    userChosenWords: [],
    mode: Mode.Entering,
  };

  static contextType = EttaStorageContext;

  setBackSpace = () => {
    const isVisible =
      this.state.userChosenWords.length > 0 &&
      this.state.mode === Mode.Entering;

    this.props.navigation.setOptions({
      headerRight: () => (
        <DeleteWord
          onPressBackspace={this.onPressBackspace}
          visible={isVisible}
        />
      ),
    });
  };
  componentDidUpdate = () => {
    this.setBackSpace();
  };

  componentDidMount = async () => {
    await this.retrieveMnemonic();
  };

  retrieveMnemonic = async () => {
    const { mnemonic } = this.context;
    if (mnemonic) {
      const shuffledMnemonic = getShuffledWordSet(mnemonic);

      this.setState({
        mnemonic,
        mnemonicWords: shuffledMnemonic,
        mnemonicLength: shuffledMnemonic.length,
      });
    } else {
      onGetMnemonicFail(this.props.showError, 'ManualBackupQuiz');
    }
  };

  onPressMnemonicWord = (word: string, index: number) => {
    const { mnemonicWords, userChosenWords } = this.state;
    const mnemonicWordsUpdated = [...mnemonicWords];
    mnemonicWordsUpdated.splice(index, 1);

    const newUserChosenWords = [...userChosenWords, { word, index }];

    this.setState({
      mnemonicWords: mnemonicWordsUpdated,
      userChosenWords: newUserChosenWords,
    });
  };

  onPressBackspace = () => {
    const { mnemonicWords, userChosenWords } = this.state;

    if (!userChosenWords.length) {
      return;
    }

    const userChosenWordsUpdated = [...userChosenWords];
    const lastWord = userChosenWordsUpdated.pop();
    const mnemonicWordsUpdated = [...mnemonicWords];
    mnemonicWordsUpdated.splice(lastWord!.index, 0, lastWord!.word);

    this.setState({
      mnemonicWords: mnemonicWordsUpdated,
      userChosenWords: userChosenWordsUpdated,
    });
  };

  onPressReset = async () => {
    const { mnemonic } = this.context;
    this.setState({
      mnemonicWords: getShuffledWordSet(mnemonic),
      userChosenWords: [],
      mode: Mode.Entering,
    });
  };

  afterCheck = async () => {
    const { userChosenWords, mnemonicLength } = this.state;
    const lengthsMatch = userChosenWords.length === mnemonicLength;
    const { mnemonic, setBackupComplete } = this.context;
    if (lengthsMatch && contentMatches(userChosenWords, mnemonic)) {
      Logger.debug(TAG, 'Backup quiz passed');
      setBackupComplete(true); // update state through context
      navigate('ManualBackupComplete');
    } else {
      Logger.debug(TAG, 'Backup quiz failed, reseting words');
      this.setState({ mode: Mode.Failed });
    }
  };

  onPressSubmit = () => {
    this.setState({ mode: Mode.Checking });
    setTimeout(this.afterCheck, CHECKING_DURATION);
  };

  onScreenSkip = () => {
    const { setBackupComplete } = this.context;
    Logger.debug(TAG, 'Skipping backup quiz');
    setBackupComplete(false); // maintain manual backup completion state as false
  };

  render() {
    const { t } = this.props;
    const {
      mnemonicWords: mnemonicWordButtons,
      userChosenWords,
      mnemonicLength,
    } = this.state;
    const currentWordIndex = userChosenWords.length + 1;
    const isQuizComplete =
      userChosenWords.length === mnemonicLength && mnemonicLength !== 0;
    const mnemonicWordsToDisplay = mnemonicWordButtons.slice(
      0,
      MNEMONIC_BUTTONS_TO_DISPLAY
    );
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.chosenWordsContainer}>
            {times(mnemonicLength, i => (
              <View
                style={[
                  styles.chosenWordWrapper,
                  userChosenWords[i] && styles.chosenWordWrapperFilled,
                ]}
                key={`selected-word-${i}`}
              >
                <Text
                  style={
                    userChosenWords[i]
                      ? styles.chosenWordFilled
                      : styles.chosenWord
                  }
                >
                  {(userChosenWords[i] && userChosenWords[i].word) || i + 1}
                </Text>
              </View>
            ))}
          </View>
          {this.state.mode === Mode.Failed && (
            <View style={styles.resetButton}>
              <TextButton onPress={this.onPressReset}>
                {t('manualBackupQuiz.resetBtn')}
              </TextButton>
            </View>
          )}
          <View style={styles.bottomHalf}>
            {!isQuizComplete && (
              <Text style={styles.bodyText}>
                <Trans
                  i18nKey={'manualBackupQuiz.backupQuizWordCount'}
                  tOptions={{
                    ordinal: t(`manualBackupQuiz.ordinals.${currentWordIndex}`),
                  }}
                />
              </Text>
            )}
            <View style={styles.mnemonicButtonsContainer}>
              {mnemonicWordsToDisplay.map((word, index) => (
                <Word
                  key={word}
                  word={word}
                  index={index}
                  onPressWord={this.onPressMnemonicWord}
                />
              ))}
            </View>
          </View>
        </ScrollView>
        <QuizChecker
          onPressSubmit={this.onPressSubmit}
          isQuizComplete={isQuizComplete}
          mode={this.state.mode}
        />
      </SafeAreaView>
    );
  }
}

interface WordProps {
  word: string;
  index: number;
  onPressWord: (word: string, index: number) => void;
}

const Word = React.memo(function _Word({
  word,
  index,
  onPressWord,
}: WordProps) {
  const onPressMnemonicWord = React.useCallback(() => {
    onPressWord(word, index);
  }, [word, index]);

  return (
    <View
      key={'mnemonic-button-' + word}
      style={styles.mnemonicWordButtonOutterRim}
    >
      <Touchable
        style={styles.mnemonicWordButton}
        onPress={onPressMnemonicWord}
      >
        <Text style={styles.mnemonicWordButonText}>{word}</Text>
      </Touchable>
    </View>
  );
});

interface Content {
  word: string;
  index: number;
}

function contentMatches(userChosenWords: Content[], mnemonic: string) {
  return userChosenWords.map(w => w.word).join(' ') === mnemonic;
}

function DeleteWord({
  onPressBackspace,
  visible,
}: {
  onPressBackspace: () => void;
  visible: boolean;
}) {
  if (!visible) {
    return null;
  }
  return (
    <Touchable
      borderless={true}
      onPress={onPressBackspace}
      style={styles.backWord}
    >
      <Backspace color={colors.error} />
    </Touchable>
  );
}

function getShuffledWordSet(mnemonic: string) {
  return flatMap(
    chunk(mnemonic.split(' '), MNEMONIC_BUTTONS_TO_DISPLAY).map(mnemonicChunk =>
      shuffle(mnemonicChunk)
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  scrollContainer: {
    paddingTop: 24,
    flexGrow: 1,
  },
  bottomHalf: { flex: 1, justifyContent: 'center' },
  bodyText: {
    marginTop: 20,
    ...fontStyles.regular,
    color: colors.dark,
    textAlign: 'center',
  },
  bodyTextBold: {
    ...fontStyles.regular500,
    textAlign: 'center',
    marginTop: 25,
  },
  chosenWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 288,
    alignSelf: 'center',
    marginTop: 20,
  },
  chosenWordWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 3,
    marginVertical: 8,
    minWidth: 55,
    borderWidth: 1,
    borderColor: colors.gray2,
    borderRadius: 100,
  },
  chosenWordWrapperFilled: {
    backgroundColor: colors.gray2,
  },
  chosenWord: {
    ...fontStyles.small,
    textAlign: 'center',
    lineHeight: undefined,
    color: colors.gray4,
  },
  chosenWordFilled: {
    ...fontStyles.small,
    textAlign: 'center',
    lineHeight: undefined,
    color: colors.gray5,
  },
  mnemonicButtonsContainer: {
    marginTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mnemonicWordButtonOutterRim: {
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: colors.greenUI,
    overflow: 'hidden',
    marginVertical: 4,
    marginHorizontal: 4,
  },
  mnemonicWordButton: {
    borderRadius: 100,
    minWidth: 65,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mnemonicWordButonText: {
    textAlign: 'center',
    color: colors.greenUI,
  },
  backWord: {
    paddingRight: 24,
    paddingLeft: 16,
    paddingVertical: 4,
  },
  resetButton: { alignItems: 'center', padding: 24, marginTop: 8 },
  cancelButton: {
    color: colors.gray4,
  },
});

export default withTranslation<Props>()(ManualBackupQuiz);