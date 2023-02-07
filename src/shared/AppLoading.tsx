import * as React from 'react';
import type { WithTranslation } from 'react-i18next';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { Button, Colors } from 'etta-ui';
import { withTranslation } from '../i18n';
import { restartApp } from '../utils/restart';

const SHOW_RESTART_BUTTON_TIMEOUT = 10000;

interface State {
  showRestartButton: boolean;
}

type Props = {} & WithTranslation;
export class AppLoading extends React.Component<Props, State> {
  showRestartButtonTimer: number | null = null;

  state = {
    showRestartButton: false,
  };

  componentDidMount() {
    this.showRestartButtonTimer = window.setTimeout(
      this.showRestartButton,
      SHOW_RESTART_BUTTON_TIMEOUT
    );
  }

  componentWillUnmount() {
    if (this.showRestartButtonTimer) {
      clearTimeout(this.showRestartButtonTimer);
    }
  }

  showRestartButton = () => {
    this.setState({ showRestartButton: true });
  };

  render() {
    const { t } = this.props;

    return (
      <SafeAreaView style={styles.content}>
        <View style={styles.button}>
          {this.state.showRestartButton && (
            <Button
              onPress={restartApp}
              title={t('errorScreen.restartApp')}
              appearance="filled"
            />
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    backgroundColor: Colors.orange.base,
  },

  button: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 20,
    paddingRight: 20,
    flex: 1,
  },
});

export default withTranslation<Props>()(AppLoading);
