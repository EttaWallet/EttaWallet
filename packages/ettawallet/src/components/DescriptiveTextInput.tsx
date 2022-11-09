import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput } from 'react-native';
import { MAX_COMMENT_LENGTH } from '../config';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

interface Props {
  comment: string;
  onCommentChange: (comment: string) => void;
  onBlur: () => void;
}

const DescriptiveTextInput = ({ onCommentChange, comment, onBlur }: Props) => {
  const { t } = useTranslation();

  return (
    <TextInput
      style={styles.inputContainer}
      autoFocus={false}
      multiline={true}
      numberOfLines={5}
      maxLength={MAX_COMMENT_LENGTH}
      onChangeText={onCommentChange}
      value={comment}
      placeholder={t('addNote')}
      placeholderTextColor={colors.greenUI}
      returnKeyType={'done'}
      onBlur={onBlur}
      blurOnSubmit={true}
    />
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    // Fixed height to increase surface area for input
    // to focus on press
    height: 100,
    textAlignVertical: 'top',
    alignSelf: 'stretch',
    ...fontStyles.regular,
  },
});

export default DescriptiveTextInput;
