import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectOption from '../../components/SelectOption';
import i18n from '../../../i18n';
import { LocalCurrencyCode, LOCAL_CURRENCY_CODES } from '../../utils/currency';
import { emptyHeader } from '../../navigation/headers/Headers';
import { navigate } from '../../navigation/NavigationService';
import fontStyles from '../../styles/fonts';
import { EttaStorageContext } from '../../../storage/context';
import { TopBarTextIconButton } from '../../navigation/headers/TopBarButton';
import BackChevron from '../../icons/BackChevron';
import colors from '../../styles/colors';

const DEFAULT_CURRENCY_CODE = LocalCurrencyCode.UGX;

function keyExtractor(item: LocalCurrencyCode) {
  return item;
}

const LocalCurrencySetting = () => {
  const { prefferedCurrency, updateLocalCurrency } =
    useContext(EttaStorageContext);

  const selectedCurrencyCode = prefferedCurrency || DEFAULT_CURRENCY_CODE;

  const onSelect = (code: string) => {
    updateLocalCurrency(code as LocalCurrencyCode);

    // @TODO: preffered currency update only updating after going back to Base Settings and then back to General.
    // Selected currency in updated state doesn't show when we go back
    requestAnimationFrame(() => {
      navigate('GeneralSettings'); // should go back
    });
  };

  const renderItem = ({
    item: code,
  }: ListRenderItemInfo<LocalCurrencyCode>) => {
    return (
      <SelectOption
        key={code}
        text={code}
        onSelect={onSelect}
        isSelected={code === selectedCurrencyCode}
        data={code}
      />
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FlatList
        initialNumToRender={30}
        style={styles.container}
        data={LOCAL_CURRENCY_CODES}
        extraData={selectedCurrencyCode}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  title: {
    ...fontStyles.h2,
    margin: 16,
  },
});

LocalCurrencySetting.navigationOptions = () => ({
  ...emptyHeader,
  headerLeft: () => (
    <TopBarTextIconButton
      title="Back"
      titleStyle={{ color: colors.dark }}
      icon={<BackChevron color={colors.dark} />}
      onPress={() => navigate('GeneralSettings')}
    />
  ),
  headerTitle: i18n.t('selectCurrency'),
  headerTitleStyle: {
    ...fontStyles.regular600,
  },
});

export default LocalCurrencySetting;
