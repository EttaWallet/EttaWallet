import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import { headerWithBackButton } from '../navigation/Headers';
import { navigateBack } from '../navigation/NavigationService';
import { Colors, TypographyPresets } from 'etta-ui';
import SelectionOption from '../components/SelectionOption';
import { useStoreDispatch, useStoreState } from '../state/hooks';
import { ELocalCurrencyCode } from '../utils/types';

export const LOCAL_CURRENCY_CODES = Object.values(ELocalCurrencyCode);

function keyExtractor(item: ELocalCurrencyCode) {
  return item;
}

const CurrencyChooserScreen = () => {
  const { t } = useTranslation();
  const dispatch = useStoreDispatch();
  const chosenCurrency = useStoreState((state) => state.nuxt.localCurrency);

  const onSelect = (code: string) => {
    dispatch.nuxt.setLocalCurrency(code as ELocalCurrencyCode);
    requestAnimationFrame(() => {
      navigateBack();
    });
  };

  const renderItem = ({ item: code }: ListRenderItemInfo<ELocalCurrencyCode>) => {
    return (
      <SelectionOption
        key={code}
        hideCheckboxes={!true}
        text={code}
        onSelect={onSelect}
        isSelected={code === chosenCurrency}
        data={code}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('selectCurrency')}</Text>
      <FlatList
        style={styles.container}
        initialNumToRender={LOCAL_CURRENCY_CODES.length}
        data={LOCAL_CURRENCY_CODES}
        extraData={chosenCurrency}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </SafeAreaView>
  );
};

CurrencyChooserScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...TypographyPresets.Header5,
    margin: 16,
    color: Colors.common.black,
  },
});

export default CurrencyChooserScreen;
