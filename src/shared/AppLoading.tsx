import * as React from 'react';
import type { WithTranslation } from 'react-i18next';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { Button, Colors, TypographyPresets } from 'etta-ui';
import { withTranslation } from '../i18n';
import { restartApp } from '../utils/restart';

// determines how after this appears to ask user to restart app
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
        <View>
          <ActivityIndicator size="large" color={Colors.orange.base} />
        </View>
        <View style={styles.button}>
          {this.state.showRestartButton && (
            <>
              <Text style={styles.advice}>{t('errorScreen.shouldRestart')}</Text>
              <Button
                onPress={restartApp}
                title={t('errorScreen.restartApp')}
                appearance="filled"
              />
            </>
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
    paddingHorizontal: 16,
    marginTop: 32,
  },
  advice: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 50,
    flex: 1,
  },
});

export default withTranslation<Props>()(AppLoading);
