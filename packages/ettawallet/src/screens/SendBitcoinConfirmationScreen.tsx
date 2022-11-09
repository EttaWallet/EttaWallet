import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Button } from '@ettawallet/react-native-kit';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DescriptiveTextInput from '../components/DescriptiveTextInput';
import HorizontalLine from '../components/HorizontalLine';
import LineItemRow from '../components/LineItemRow';
import AmountDisplay from '../components/Transact/AmountDisplay';
import { Send } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { noHeader } from '../navigation/headers/Headers';
import HeaderWithBackButton from '../navigation/headers/HeaderWithBackButton';
import { navigate } from '../navigation/NavigationService';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';
import FeeSelectionSheet from '../components/FeeSelectionSheet';
import FeeSelector from '../components/Transact/FeePicker';

interface Props {
  feeOption: string;
  onChangeFee: (fee: string) => void;
}

const SendBitcoinConfirmation = ({ feeOption, onChangeFee }: Props) => {
  const [comment, setComment] = useState('');
  const [showingFeePicker, setShowFeePicker] = useState(false);
  const [btcAddress, setBtcAddress] = useState('');
  const [selectedFee, setSelectedFee] = useState('');
  const { t } = useTranslation();

  const openFeePicker = () => setShowFeePicker(true);
  const closeFeePicker = () => setShowFeePicker(false);

  const amount = {
    value: 0.5,
    localAmount: 0,
  };

  const onBlur = () => {
    const trimmedComment = comment.trim();
    setComment(trimmedComment);
  };

  const onFeeSelected = (fee: string) => {
    setShowFeePicker(false);
    // onChangeFee(fee);
    setSelectedFee(fee);
  };

  const buildFeeList = [
    {
      label: 'Fast',
      time: '10mins',
      type: 'Fast',
      rate: '1sat/vbyte',
      amount: 226,
    },
    {
      label: 'Medium',
      time: '1 hour',
      type: 'Medium',
      rate: '1sat/vbyte',
      amount: 2546,
    },
    {
      label: 'Slow',
      time: '3 hours',
      type: 'Slow',
      rate: '1sat/vbyte',
      amount: 5500,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithBackButton />
      <HorizontalLine />
      <LineItemRow
        title={t('sendBitcoin.confirmation.amountLabel')}
        amount={
          <AmountDisplay
            amount={amount.value}
            localAmount={amount.localAmount}
            hideSign={true}
          />
        }
      />
      <LineItemRow
        title={<Text style={styles.extraInfo}>Amount in sats</Text>}
        amount={
          <AmountDisplay
            amount={amount.value}
            localAmount={amount.localAmount}
            hideSign={true}
            style={styles.extraInfo}
            textStyle={styles.subtotalText}
          />
        }
      />
      <HorizontalLine />
      <LineItemRow
        title={t('sendBitcoin.confirmation.localAmountLabel')}
        amount={
          <AmountDisplay
            amount={amount.value}
            localAmount={amount.localAmount}
            hideSign={true}
          />
        }
      />
      <HorizontalLine />
      <LineItemRow
        title={t('sendBitcoin.confirmation.fees')}
        amount={
          <FeeSelector feeOption={selectedFee} onChangeFee={openFeePicker} />
        }
      />
      <FeeSelectionSheet
        isVisible={showingFeePicker}
        onFeeSelected={onFeeSelected}
        onClose={closeFeePicker}
        fees={buildFeeList}
      />
      <HorizontalLine />
      <DescriptiveTextInput
        onCommentChange={setComment}
        comment={comment}
        onBlur={onBlur}
      />

      <Button
        style={styles.button}
        color="primary"
        variant="filled"
        tone="orange"
        onPress={() => navigate('MainArea')}
      >
        <Text fontColor="light">{t('sendBitcoin.confirmation.sendBtn')}</Text>
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignContent: 'space-between',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  text: {
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 18,
    color: '#777777',
  },
  button: {
    marginTop: 'auto',
  },
  extraInfo: {
    ...fontStyles.small,
    color: colors.gray4,
  },
  inputContainer: {
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.gray3,
  },
  input: {
    ...fontStyles.regular,
  },
});

SendBitcoinConfirmation.navigationOptions = noHeader;

export default SendBitcoinConfirmation;
