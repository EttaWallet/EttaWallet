import React from 'react';
import { EPaymentType, TLightningPayment } from '../utils/types';
import { humanizeTimestamp } from '../utils/time';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { navigate } from '../navigation/NavigationService';
import { Screens } from '../navigation/Screens';
import { StyleSheet, Text, View } from 'react-native';
import ContactAvatar from './ContactAvatar';
import TransactionAmount from './TransactionAmount';
import { Colors, Icon, TypographyPresets } from 'etta-ui';
import i18n from '../i18n';
import { capitalize } from 'lodash';

interface TransactionItemProps {
  payment: TLightningPayment;
}

const TransactionItem = ({ payment }: TransactionItemProps) => {
  const transactionSubText = payment.note
    ? payment.note
    : humanizeTimestamp(payment.unix_timestamp!, i18n);

  const transactionPrefix = (type: EPaymentType) => {
    let prefix: string;
    if (type === EPaymentType.received) {
      prefix = 'Received from';
    } else {
      prefix = 'Sent to';
    }
    return prefix;
  };

  return (
    <TouchableOpacity
      onPress={() => {
        cueInformativeHaptic();
        navigate(Screens.ActivityDetailsScreen, {
          transaction: payment,
        });
      }}
    >
      <View style={styles.container}>
        {payment.contact ? (
          <ContactAvatar contact={payment.contact} />
        ) : payment.type === EPaymentType.sent ? (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(235, 87, 87, 0.1)' }]}>
            <Icon name="icon-arrow-up" style={styles.sentIcon} />
          </View>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
            <Icon name="icon-arrow-down" style={styles.receivedIcon} />
          </View>
        )}
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>
            {payment.contact
              ? `${transactionPrefix(payment?.type!)} ${payment.contact.alias}`
              : `${capitalize(payment.type)}`}
          </Text>
          <Text style={styles.transactionSubtitle} numberOfLines={1}>
            {transactionSubText}
          </Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <TransactionAmount
            totalAmount={payment.amount_sat!}
            usingLocalCurrency={false}
            transactionType={payment.type!}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  transactionContent: {
    paddingHorizontal: 10,
    flex: 1,
    flexGrow: 1,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
    flex: 0,
    maxWidth: '35%',
  },
  transactionTitle: {
    ...TypographyPresets.Body4,
    flexShrink: 1,
  },
  transactionSubtitle: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
  transactionAmount: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
    paddingTop: 2,
    flexWrap: 'wrap',
    textAlign: 'right',
  },
  sentIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.red.base,
  },
  receivedIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.green.base,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 50,
  },
});

export default TransactionItem;
