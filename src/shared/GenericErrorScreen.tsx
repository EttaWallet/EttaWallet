import * as React from 'react';
import FullScreenBanner from '../components/FullScreenBanner';
import { restartApp } from '../utils/restart';
import { useTranslation } from 'react-i18next';
import { ErrorCategory } from '../utils/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.GenericErrorScreen>;
type Props = {
  errorMessage?: string;
  route?: RouteProps;
};

const GenericErrorScreen = (props: Props) => {
  const { t } = useTranslation();
  return (
    <FullScreenBanner
      category={ErrorCategory.INFO}
      primaryCTALabel={t('errorScreen.restartApp')}
      primaryCTA={restartApp}
      title={t('errorScreen.defaultTitle')}
      description={props.errorMessage!}
    />
  );
};

export default GenericErrorScreen;
