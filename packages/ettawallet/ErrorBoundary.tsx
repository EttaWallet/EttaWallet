import { getErrorMessage } from './src/utils/errors';
import * as Sentry from '@sentry/react-native';
import * as React from 'react';
import { WithTranslation } from 'react-i18next';
import ErrorScreen from './ErrorScreen';
import { withTranslation } from './i18n';

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

  componentDidCatch(error: Error, info: any) {
    this.setState({ childError: error });
    Sentry.captureException(error);
  }

  render() {
    const { childError } = this.state;
    if (childError) {
      return <ErrorScreen errorMessage={getErrorMessage(childError)} />;
    }

    return this.props.children;
  }
}

export default withTranslation<Props>()(ErrorBoundary);
