import React from 'react';
import { TInvoice } from '@synonymdev/react-native-ldk';
import { EPaymentType, TContact } from '../utils/types';
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
  invoice: TInvoice;
  txType: EPaymentType;
  memo?: string;
  contact?: TContact;
  txTimestamp?: number;
}

const TransactionItem = ({ invoice, txType, memo, contact, txTimestamp }: TransactionItemProps) => {
  const transactionSubText = memo
    ? memo
    : humanizeTimestamp(txTimestamp || invoice.timestamp, i18n);

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
      disabled={false}
      onPress={() => {
        cueInformativeHaptic();
        navigate(Screens.ActivityDetailsScreen, {
          transaction: { invoice: invoice, type: txType },
        });
      }}
    >
      <View style={styles.container}>
        {contact ? (
          <ContactAvatar contact={contact} />
        ) : txType === EPaymentType.sent ? (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(45, 156, 219, 0.1)' }]}>
            <Icon name="icon-arrow-up" style={styles.sentIcon} />
          </View>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(39, 174, 96, 0.1)' }]}>
            <Icon name="icon-arrow-down" style={styles.receivedIcon} />
          </View>
        )}
        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>
            {contact
              ? `${transactionPrefix(txType)} ${contact.alias}`
              : invoice.description
              ? invoice.description
              : `${capitalize(txType)} (no description)`}
          </Text>
          <Text style={styles.transactionSubtitle} numberOfLines={1}>
            {transactionSubText}
          </Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <TransactionAmount
            totalAmount={invoice.amount_satoshis!}
            usingLocalCurrency={false}
            transactionType={txType}
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
    color: Colors.blue.base,
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
