import { Platform } from 'react-native';
import prompt, { PromptOptions } from 'react-native-prompt-android';
import { useTranslation } from 'react-i18next';

module.exports = (
  title: string,
  text: string,
  isCancelable = true,
  type: PromptType | PromptTypeIOS | PromptTypeAndroid = 'secure-text',
  isOKDestructive = false
): Promise<string> => {
  const keyboardType = type === 'numeric' ? 'numeric' : 'default';

  if (Platform.OS === 'ios' && type === 'numeric') {
    // `react-native-prompt-android` on ios does not support numeric input
    type = 'plain-text';
  }

  const { t } = useTranslation();

  return new Promise((resolve, reject) => {
    const buttons: Array<PromptButton> = isCancelable
      ? [
          {
            text: t('cancel'),
            onPress: () => {
              reject(Error('Cancel Pressed'));
            },
            style: 'cancel',
          },
          {
            text: t('ok'),
            onPress: password => {
              console.log('OK Pressed');
              resolve(password);
            },
            style: isOKDestructive ? 'destructive' : 'default',
          },
        ]
      : [
          {
            text: t('ok'),
            onPress: password => {
              console.log('OK Pressed');
              resolve(password);
            },
          },
        ];

    prompt(title, text, buttons, {
      type: type,
      cancelable: isCancelable,
      keyboardType,
    });
  });
};
