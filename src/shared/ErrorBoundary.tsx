import * as Sentry from '@sentry/react-native';
import * as React from 'react';
import type { WithTranslation } from 'react-i18next';
import { withTranslation } from '../i18n';
import { getErrorMessage } from '../utils/helpers';
import GenericErrorScreen from './GenericErrorScreen';

interface State {
  childError: Error | null;
}

interface OwnProps {
  children: React.ReactChild;
}

type Props = OwnProps & WithTranslation;

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    childError: null,
  };

  componentDidCatch(error: Error) {
    this.setState({ childError: error });
    Sentry.captureException(error);
  }

  render() {
    const { childError } = this.state;
    if (childError) {
      return <GenericErrorScreen errorMessage={getErrorMessage(childError)} />;
    }

    return this.props.children;
  }
}

export default withTranslation<Props>()(ErrorBoundary);
