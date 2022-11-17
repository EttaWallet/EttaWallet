export enum ErrorMessages {
  FAILED_FETCH_MNEMONIC = 'failedFetchMnemonic',
  ACCOUNT_UNLOCK_FAILED = 'accountUnlockFailed',
  INCORRECT_PIN = 'incorrectPin',
}

export function getErrorMessage(error: Error) {
  // This replacement is because when the error reaches here, it's been wrapped
  // by Error: multiple times
  let errorMsg = error.message || error.name || 'unknown';
  errorMsg = errorMsg.replace(/Error:/g, '');
  if (error.stack) {
    errorMsg += ' in ' + error.stack.substring(0, 100);
  }
  return errorMsg;
}
