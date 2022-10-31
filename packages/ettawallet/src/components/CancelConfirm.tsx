import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import CancelButton from './CancelButton';
import Dialog from './Dialog';
import { navigate } from '../navigation/NavigationService';
import colors from '../styles/colors';

interface Props {
  screen: string;
}

export default function CancelConfirm({ screen }: Props) {
  const [isOpen, setOpenState] = React.useState(false);
  const { t } = useTranslation();

  const actionText = t('cancelDialog.action');
  const secondaryText = t('cancelDialog.secondary');

  const onCancel = React.useCallback(() => {
    setOpenState(true);
  }, [screen]);

  const onComplete = React.useCallback(() => {
    setOpenState(false);
  }, [screen, actionText]);

  const onProcrastinate = React.useCallback(() => {
    setOpenState(false);
    navigate('MainArea');
  }, [screen, secondaryText]);

  return (
    <>
      <Dialog
        title={t('cancelDialog.title')}
        isVisible={isOpen}
        actionText={actionText}
        actionPress={onComplete}
        secondaryActionPress={onProcrastinate}
        secondaryActionText={secondaryText}
      >
        {t('cancelDialog.body')}
      </Dialog>
      <CancelButton onCancel={onCancel} style={styles.button} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    color: colors.gray4,
  },
});
