import { TOptions } from 'i18next';
import { ErrorMessages } from './errors';
import { ALERTS_DURATION } from '../../config';
import i18n from '../i18n';
import {
  AlertActions,
  AlertTypes,
  ErrorDisplayType,
  HideAlertAction,
  ShowAlertAction,
} from './types';

export const showMessage = (
  message: string,
  dismissAfter?: number | null,
  buttonMessage?: string | null,
  title?: string | null
): ShowAlertAction => {
  return showAlert(AlertTypes.MESSAGE, message, dismissAfter, buttonMessage, title);
};

export const showToast = (
  message: string,
  buttonMessage: string | null,
  title: string | null
): ShowAlertAction => {
  return showAlert(AlertTypes.TOAST, message, null, buttonMessage, title);
};

export const showError = (
  error: ErrorMessages,
  dismissAfter?: number | null | undefined,
  i18nOptions?: object
): ShowAlertAction => {
  return showAlert(
    AlertTypes.ERROR,
    i18n.t(error, { ...(i18nOptions || {}) }),
    dismissAfter,
    null,
    null,
    error
  );
};

export const showErrorInline = (error: ErrorMessages, i18nOptions?: TOptions): ShowAlertAction => ({
  type: AlertActions.SHOW,
  alertType: AlertTypes.ERROR,
  displayMethod: ErrorDisplayType.INLINE,
  message: i18n.t(error, { ...(i18nOptions || {}) }),
  underlyingError: error,
});

// Useful for showing a more specific error if its a documented one, with
// a fallback to something more generic
export function showErrorOrFallback(error: any, fallback: ErrorMessages) {
  if (error && Object.values(ErrorMessages).includes(error.message)) {
    return showError(error.message);
  }

  return showError(fallback);
}

const showAlert = (
  alertType: AlertTypes,
  message: string,
  dismissAfter: number | null = ALERTS_DURATION,
  buttonMessage?: string | null,
  title?: string | null,
  underlyingError?: ErrorMessages | null
): ShowAlertAction => {
  return {
    type: AlertActions.SHOW,
    alertType,
    displayMethod: ErrorDisplayType.BANNER,
    message,
    dismissAfter,
    buttonMessage,
    title,
    underlyingError,
  };
};

export const hideAlert = (): HideAlertAction => ({
  type: AlertActions.HIDE,
});
