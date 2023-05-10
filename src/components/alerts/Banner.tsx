import { noop } from 'lodash';
import React, { memo, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { hideAlert } from '../../utils/alerts';
import { Alert, AlertTypes, ErrorDisplayType } from '../../utils/types';
import ToastWithCTA from './ToastWithCTA';
import TopAlert from './TopAlert';
import store from '../../state/store';

function AlertBanner() {
  const [toastAlert, setToastAlert] = useState<(Alert & { isActive: boolean }) | null>(null);
  const alert = store.getState().app.alert;

  const onPressToast = () => {
    hideAlert();
  };

  const displayAlert = useMemo(() => {
    setToastAlert((prev) => {
      if (alert?.type === AlertTypes.TOAST) {
        return { ...alert, isActive: true };
      }

      return prev === null ? null : { ...prev, isActive: false };
    });

    if (alert?.displayMethod === ErrorDisplayType.BANNER && (alert.title || alert.message)) {
      const onPress = () => {
        hideAlert();
      };

      const { type, title, message, buttonMessage, dismissAfter } = alert;

      return {
        type,
        title,
        message,
        buttonMessage,
        dismissAfter,
        onPress,
      };
    } else {
      return null;
    }
  }, [alert]);

  // avoid conditionally rendering the Toast component to preserve the dismiss animation
  return (
    <>
      <View style={styles.floating}>
        <TopAlert alert={displayAlert} />
      </View>

      <ToastWithCTA
        showToast={!!toastAlert?.isActive}
        title={toastAlert?.title || ''}
        message={toastAlert?.message || ''}
        labelCTA={toastAlert?.buttonMessage || ''}
        onPress={toastAlert?.isActive ? onPressToast : noop}
      />
    </>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export default memo(AlertBanner);
