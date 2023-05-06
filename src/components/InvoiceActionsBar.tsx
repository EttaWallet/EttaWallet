import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button } from 'etta-ui';
import { moderateScale, verticalScale } from '../utils/sizing';
import Clipboard from '@react-native-clipboard/clipboard';
import Logger from '../utils/logger';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

interface ActionProps {
  paymentRequest: string;
  allowModifier?: boolean;
  onPressModify?: () => void;
  smallButtons?: boolean;
}

const InvoiceActionsBar = (props: ActionProps) => {
  const { t } = useTranslation();

  const [copied, setCopied] = useState(false);

  const onPressCopy = () => {
    setCopied(false);
    Clipboard.setString(props.paymentRequest || '');
    Logger.showMessage(t('Invoice copied to clipboard'));
    cueInformativeHaptic();
    setCopied(true);
  };

  const onPressShare = () => {
    // pull up device share flow (QR code image or invoice?)
    cueInformativeHaptic();
    return 0;
  };

  const onPressModify = () => {
    props.onPressModify?.();
    cueInformativeHaptic();
  };

  return (
    <View style={styles.container}>
      <Button
        style={{ marginRight: 5 }}
        title="Share"
        icon="icon-share"
        iconPosition="left"
        onPress={onPressShare}
        appearance="outline"
        size={props.smallButtons === true ? 'small' : 'default'}
      />
      <Button
        title={copied ? 'Copied' : 'Copy'}
        style={{ marginLeft: 5, marginRight: 5 }}
        icon={copied ? 'icon-check' : 'icon-copy'}
        iconPosition="left"
        onPress={onPressCopy}
        appearance={copied ? 'filled' : 'outline'}
        size={props.smallButtons === true ? 'small' : 'default'}
      />
      {props.allowModifier ? (
        <Button
          title="Modify"
          style={{ marginLeft: 5 }}
          icon="icon-edit"
          iconPosition="left"
          onPress={onPressModify}
          appearance="outline"
          size={props.smallButtons === true ? 'small' : 'default'}
        />
      ) : (
        ''
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(10),
  },
});

export default InvoiceActionsBar;
