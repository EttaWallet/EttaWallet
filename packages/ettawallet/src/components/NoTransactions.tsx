import * as React from 'react';
import { WithTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { withTranslation } from '../../i18n';
import colors from '../styles/colors';
import fontStyles from '../styles/fonts';

type Props = WithTranslation;

export class NoTransactions extends React.PureComponent<Props> {
  render() {
    const { loading, error, t } = this.props;

    if (error) {
      return (
        <View style={styles.container} testID="NoActivity/error">
          <Text style={styles.text}>{t('errorLoadingActivity.0')}</Text>
          <Text style={styles.text}>{t('errorLoadingActivity.1')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {loading && (
          <ActivityIndicator
            style={styles.icon}
            size="large"
            color={colors.greenBrand}
          />
        )}
        <Text style={styles.text}>{t('transactionFeed.noTransactions')} </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 32,
  },
  icon: {
    marginVertical: 20,
    height: 108,
    width: 108,
  },
  text: {
    ...fontStyles.large,
    color: colors.gray3,
  },
});

export default withTranslation<Props>()(NoTransactions);
