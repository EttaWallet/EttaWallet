import * as React from 'react';
import FullScreenBanner from '../components/FullScreenBanner';
import { ErrorCategory } from '../utils/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { noHeader } from '../navigation/Headers';
import { Platform } from 'react-native';
import { navigateBack, navigateHome } from '../navigation/NavigationService';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.TransactionErrorScreen>;

const TransactionErrorScreen = (props: RouteProps) => {
  const defaultError =
    'Sorry, the problem could not be identified. Your funds remain securely in your wallet.';

  const canRetry = props.route.params.canRetry;

  const showSuggestions = props.route.params.showSuggestions;

  return canRetry ? (
    <FullScreenBanner
      category={ErrorCategory.INFO}
      primaryCTALabel="Retry"
      primaryCTA={navigateBack}
      title="The transaction could not be completed"
      description={props.route.params.errorMessage || defaultError}
      secondaryCTALabel="Okay"
      secondaryCTA={() => 0}
      showSuggestions={showSuggestions}
    />
  ) : (
    <FullScreenBanner
      category={ErrorCategory.INFO}
      primaryCTALabel="Okay"
      primaryCTA={navigateHome}
      title="The transaction could not be completed"
      description={props.route.params.errorMessage || defaultError}
      showSuggestions={showSuggestions}
    />
  );
};

TransactionErrorScreen.navigationOptions = {
  ...noHeader,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

export default TransactionErrorScreen;
