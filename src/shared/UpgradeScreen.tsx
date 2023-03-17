import * as React from 'react';
import type { WithTranslation } from 'react-i18next';
import { withTranslation } from '../i18n';
import { emptyHeader } from '../navigation/Headers';
import { navigateAppStore } from '../utils/helpers';
import FullScreenBanner from '../components/FullScreenBanner';

type Props = WithTranslation;

class UpgradeScreen extends React.Component<Props> {
  static navigationOptions = {
    ...emptyHeader,
  };

  render() {
    const { t } = this.props;
    return (
      <FullScreenBanner
        title={t('appUpdateAvailable')}
        subtitle={t('appIsOutdated')}
        CTAText={t('update')}
        CTAHandler={navigateAppStore}
      />
    );
  }
}

export default withTranslation<Props>()(UpgradeScreen);
