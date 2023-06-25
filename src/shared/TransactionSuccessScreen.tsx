import * as React from 'react';
import FullScreenBanner from '../components/FullScreenBanner';
import { TransactionState } from '../utils/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { noHeader } from '../navigation/Headers';
import { Platform } from 'react-native';
import { navigateHome } from '../navigation/NavigationService';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.TransactionSuccessScreen>;

const TransactionSuccessScreen = (props: RouteProps) => {
  const txId = props.route.params.txId || '';
  const amountInSats = props.route.params.amountInSats || 0;

  const onPressDone = () => {
    cueInformativeHaptic();
    navigateHome();
  };

  return (
    <FullScreenBanner
      category={TransactionState.Success}
      primaryCTALabel="Got it"
      primaryCTA={onPressDone}
      title={`You received ${amountInSats} sats`}
      description={txId}
    />
  );
};

TransactionSuccessScreen.navigationOptions = {
  ...noHeader,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

export default TransactionSuccessScreen;
