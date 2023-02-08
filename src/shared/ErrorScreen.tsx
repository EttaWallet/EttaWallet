import type { RouteProp } from '@react-navigation/native';
import { TypographyPresets, Colors } from 'etta-ui';
import * as React from 'react';
import type { WithTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import FullScreenBanner from '../components/FullScreenBanner';
import { withTranslation } from '../i18n';
import type { Screens } from '../navigation/Screens';
import type { StackParamList } from '../navigation/types';
import { restartApp } from '../utils/restart';

interface OwnProps {
  errorMessage?: string;
  route?: RouteProp<StackParamList, Screens.ErrorScreen>;
}

type Props = OwnProps & WithTranslation;

class ErrorScreen extends React.Component<Props> {
  static navigationOptions = { header: null };

  getErrorMessage = () => {
    return this.props.errorMessage || this.props.route?.params.errorMessage || 'unknown';
  };

  render() {
    const { t } = this.props;
    const errorMessage = this.getErrorMessage();
    return (
      <FullScreenBanner
        CTAText={t('errorScreen.restartApp')}
        CTAHandler={restartApp}
        title={t('errorScreen.defaultTitle')}
        subtitle={t('errorScreen.defaultDescription')}
      >
        <View>
          <Text
            style={styles.errorMessage}
            numberOfLines={10}
            ellipsizeMode="tail"
            selectable={true}
          >
            {t(errorMessage)}
          </Text>
        </View>
      </FullScreenBanner>
    );
  }
}

const styles = StyleSheet.create({
  errorMessage: {
    ...TypographyPresets.Body5,
    borderRadius: 5,
    backgroundColor: Colors.neutrals.light.neutral2,
    color: Colors.common.black,
    padding: 15,
  },
});

export default withTranslation<Props>()(ErrorScreen);
