import { ALERTS_DURATION } from '../../config';
import { Notifier, NotifierComponents } from 'react-native-notifier';
import ToastWithCTA from '../components/alerts/ToastWithCTA';
import { TypographyPresets } from 'etta-ui';

export const showToast = ({
  message,
  dismissAfter,
  title,
}: {
  message: string;
  dismissAfter?: number | null;
  title?: string | null;
}) => {
  const alertDuration = dismissAfter ? dismissAfter : ALERTS_DURATION;
  Notifier.showNotification({
    title: title!,
    duration: alertDuration,
    description: message,
  });
};

export const showToastWithCTA = ({
  message,
  dismissAfter,
  title,
  buttonLabel,
  buttonAction,
}: {
  message: string;
  dismissAfter?: number | null;
  title?: string | null;
  buttonLabel?: string;
  buttonAction(): void;
}) => {
  const alertDuration = dismissAfter ? dismissAfter : ALERTS_DURATION;
  Notifier.showNotification({
    title: title!,
    duration: alertDuration,
    description: message,
    Component: ToastWithCTA,
    componentProps: {
      buttonLabel: buttonLabel,
      buttonStyle: {
        ...TypographyPresets.Body4,
        alignSelf: 'flex-end',
      },
      buttonAction: buttonAction,
    },
    hideOnPress: true,
  });
};

export const showInfoBanner = ({
  message,
  dismissAfter,
  title,
}: {
  message: string;
  dismissAfter?: number | null;
  title?: string | null;
}) => {
  const alertDuration = dismissAfter ? dismissAfter : ALERTS_DURATION;
  Notifier.showNotification({
    title: title!,
    duration: alertDuration,
    description: message,
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: 'info',
    },
  });
};

export const showErrorBanner = ({
  message,
  dismissAfter,
  title,
}: {
  message: string;
  dismissAfter?: number | null;
  title?: string | null;
}) => {
  const alertDuration = dismissAfter ? dismissAfter : ALERTS_DURATION;
  Notifier.showNotification({
    title: title!,
    duration: alertDuration,
    description: message,
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: 'error',
    },
  });
};

export const showSuccessBanner = ({
  message,
  dismissAfter,
  title,
}: {
  message: string;
  dismissAfter?: number | null;
  title?: string | null;
}) => {
  const alertDuration = dismissAfter ? dismissAfter : ALERTS_DURATION;
  Notifier.showNotification({
    title: title!,
    duration: alertDuration,
    description: message,
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: 'success',
    },
  });
};

export const showWarningBanner = ({
  message,
  dismissAfter,
  title,
}: {
  message: string;
  dismissAfter?: number | null;
  title?: string | null;
}) => {
  const alertDuration = dismissAfter ? dismissAfter : ALERTS_DURATION;
  Notifier.showNotification({
    title: title!,
    duration: alertDuration,
    description: message,
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: 'warn',
    },
  });
};
