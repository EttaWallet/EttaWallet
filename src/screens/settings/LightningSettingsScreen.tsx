import React, { useLayoutEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SettingsItemWithTextValue } from '../../components/InfoListItem';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../../navigation/Headers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStoreState } from '../../state/hooks';
import Clipboard from '@react-native-clipboard/clipboard';
import { showToast, showWarningBanner } from '../../utils/alerts';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';
import { maskString } from '../../utils/helpers';
import SectionTitle from '../../components/SectionTitle';
import useLightningSettingsBottomSheet from './useLightningSettingsBottomSheet';
import { ScrollView } from 'react-native-gesture-handler';

const LightningSettingsScreen = ({ navigation }) => {
  const nodeID = useStoreState((state) => state.lightning.nodeId);
  const receiveLimit = useStoreState((state) => state.lightning.maxReceivable);
  const maskedNodeId = maskString(nodeID!, 10);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Lightning network" />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    openUpdateDescriptionSheet,
    openUpdateExpirySheet,
    updateDescriptionBottomSheet,
    updateExpiryBottomSheet,
  } = useLightningSettingsBottomSheet();

  const onPressNodeId = () => {
    Clipboard.setString(nodeID || '');
    showToast({
      message: 'Node ID copied to clipboard',
    });
    cueInformativeHaptic();
  };

  const onPressViewLogs = () => {
    cueInformativeHaptic();
    // navigate(Screens.LogsScreen);
    showWarningBanner({ message: 'Unavailable at the moment' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView bounces={true}>
        <SectionTitle title="Defaults" style={styles.sectionHeading} />
        <SettingsItemWithTextValue
          title="Default invoice description"
          withChevron={true}
          onPress={openUpdateDescriptionSheet}
        />
        <SettingsItemWithTextValue
          title="Default invoice expiry period"
          withChevron={true}
          onPress={openUpdateExpirySheet}
        />
        <SectionTitle title="Node Information" style={styles.sectionHeading} />
        <SettingsItemWithTextValue
          title="Node ID"
          value={maskedNodeId}
          withChevron={false}
          onPress={onPressNodeId}
        />
        <SettingsItemWithTextValue
          title="Receive limit"
          value={`${receiveLimit.toLocaleString()} sats`}
          withChevron={false}
        />
        <SettingsItemWithTextValue title="View logs" withChevron={true} onPress={onPressViewLogs} />
      </ScrollView>
      {updateDescriptionBottomSheet}
      {updateExpiryBottomSheet}
    </SafeAreaView>
  );
};

LightningSettingsScreen.navigationOptions = {
  ...headerWithBackButton,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  text: {
    textAlign: 'center',
  },
  sectionHeading: {
    marginTop: 20,
  },
});

export default LightningSettingsScreen;
