import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Share } from 'react-native';
import { Button } from 'etta-ui';
import { moderateScale, verticalScale } from '../utils/sizing';
import Clipboard from '@react-native-clipboard/clipboard';
import Logger from '../utils/logger';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { showWarningBanner } from '../utils/alerts';

interface ActionProps {
  paymentRequest: string;
  allowModifier?: boolean;
  onPressDetails?: () => void;
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

  const onPressShare = async () => {
    // pull up device share flow (QR code image or invoice?)
    cueInformativeHaptic();
    try {
      const result = await Share.share({
        message: `lightning: ${props.paymentRequest.toUpperCase()}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      showWarningBanner({
        message: error.message,
      });
    }
  };

  const onPressDetails = () => {
    props.onPressDetails?.();
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
          title="Details"
          style={{ marginLeft: 5 }}
          icon="icon-ellipsis"
          iconPosition="left"
          onPress={onPressDetails}
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
