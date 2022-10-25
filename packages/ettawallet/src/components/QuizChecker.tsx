/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Mode } from '../utils/types';
import Button, { BtnSizes, BtnTypes } from '../components/Button';
import LoadingSpinner from '../images/LoadingSpinner';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

interface Props {
  onPressSubmit: () => void;
  isQuizComplete: boolean;
  mode: Mode;
}

const QuizChecker = ({ onPressSubmit, isQuizComplete, mode }: Props) => {
  if (!isQuizComplete) {
    return null;
  }
  switch (mode) {
    case Mode.Checking:
      return (
        <View style={styles.successCheck}>
          <LoadingSpinner width={24} />
        </View>
      );
    case Mode.Failed:
      return (
        <View>
          <Text style={styles.incorrect}>
            The Recovery Phrase you entered is incorrect. Please try again.
          </Text>
        </View>
      );
    default:
      return (
        <Button
          onPress={onPressSubmit}
          text="Submit"
          size={BtnSizes.FULL}
          type={BtnTypes.PRIMARY}
        />
      );
  }
};

const styles = StyleSheet.create({
  successCheck: {
    alignItems: 'center',
    marginBottom: 24,
  },
  incorrect: {
    ...fontStyles.regular500,
    textAlign: 'center',
    color: colors.warning,
  },
});

export default QuizChecker;
