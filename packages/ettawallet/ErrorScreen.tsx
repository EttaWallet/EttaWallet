import { RouteProp } from '@react-navigation/native';
import * as React from 'react';
import { WithTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import FullscreenCTA from './src/components/FullscreenCTA';
import { withTranslation } from './i18n';
import fontStyles from './src/styles/fonts';
import { restartApp, RESTART_APP_I18N_KEY } from './src/utils/restart';

interface OwnProps {
  errorMessage?: string;
  route?: RouteProp<{ params: { errorMessage?: string } }, 'params'>; // what screen? ErrorScreen?
}

type Props = OwnProps & WithTranslation;

class ErrorScreen extends React.Component<Props> {
  static navigationOptions = { header: null };

  getErrorMessage = () => {
    return (
      this.props.errorMessage ||
      this.props.route?.params.errorMessage ||
      'unknown'
    );
  };

  render() {
    const { t } = this.props;
    const errorMessage = this.getErrorMessage();
    return (
      <FullscreenCTA
        CTAText={t('errorScreen.restartApp')}
        CTAHandler={restartApp}
        title={t('errorScreen.oops')}
        subtitle={t('errorScreen.somethingWrong')}
      >
        <View>
          <Text
            style={styles.errorMessage}
            numberOfLines={10}
            ellipsizeMode="tail"
          >
            {t(errorMessage)}
          </Text>
        </View>
      </FullscreenCTA>
    );
  }
}

const styles = StyleSheet.create({
  errorMessage: {
    ...fontStyles.regular,
    fontSize: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(238, 238, 238, 0.75)',
    padding: 15,
  },
});

export default withTranslation<Props>()(ErrorScreen);
