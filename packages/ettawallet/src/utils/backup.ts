export function countMnemonicWords(phrase: string): number {
  return [...phrase.trim().split(/\s+/)].length;
}

// Because of a RN bug, we can't fully clean the text as the user types
// https://github.com/facebook/react-native/issues/11068
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function formatBackupPhraseOnEdit(phrase: string) {
  return phrase.replace(/\s+/gm, ' ');
}

function isValidMnemonic(phrase: string, length: number) {
  return (
    !!phrase && countMnemonicWords(formatBackupPhraseOnEdit(phrase)) === length
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isValidBackupPhrase(phrase: string) {
  return isValidMnemonic(phrase, 24);
}
