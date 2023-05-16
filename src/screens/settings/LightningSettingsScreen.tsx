/* eslint-disable react-native/no-inline-styles */
import React, { useLayoutEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SettingsItemWithTextValue } from '../../components/InfoListItem';
import { HeaderTitleWithSubtitle, headerWithBackButton } from '../../navigation/Headers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStoreState } from '../../state/hooks';
import Clipboard from '@react-native-clipboard/clipboard';
import { showToast } from '../../utils/alerts';
import { cueInformativeHaptic } from '../../utils/accessibility/haptics';
import { maskString } from '../../utils/helpers';
import { navigate } from '../../navigation/NavigationService';
import { Screens } from '../../navigation/Screens';
import SectionTitle from '../../components/SectionTitle';

const LightningSettingsScreen = ({ navigation }) => {
  const nodeID = useStoreState((state) => state.lightning.nodeId);
  const maskedNodeId = maskString(nodeID!);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <HeaderTitleWithSubtitle title="Lightning network" />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressNodeId = () => {
    Clipboard.setString(nodeID || '');
    showToast({
      message: 'Node ID copied to clipboard',
    });
    cueInformativeHaptic();
  };

  const onPressChannels = () => {
    cueInformativeHaptic();
    navigate(Screens.ChannelsScreen);
  };

  const onPressElectrum = () => {
    cueInformativeHaptic();
    return;
  };

  return (
    <SafeAreaView style={styles.container}>
      <SectionTitle title="Defaults" style={styles.sectionHeading} />
      <SettingsItemWithTextValue
        title="Default payment description"
        withChevron={true}
        onPress={onPressElectrum}
      />
      <SettingsItemWithTextValue
        title="Default invoice expiry period"
        withChevron={true}
        onPress={onPressElectrum}
      />
      <SectionTitle title="Advanced" style={styles.sectionHeading} />
      <SettingsItemWithTextValue
        title="Node ID"
        value={maskedNodeId}
        withChevron={false}
        onPress={onPressNodeId}
      />
      <SettingsItemWithTextValue
        title="Payment Channels"
        withChevron={true}
        onPress={onPressChannels}
      />
      <SettingsItemWithTextValue title="Peers" withChevron={true} onPress={onPressChannels} />
      <SettingsItemWithTextValue
        title="Electrum server"
        withChevron={true}
        onPress={onPressElectrum}
      />
      <SettingsItemWithTextValue
        title="View LDK logs"
        withChevron={true}
        onPress={onPressElectrum}
      />
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
  },
  text: {
    textAlign: 'center',
  },
  sectionHeading: {
    marginTop: 20,
    marginBottom: 8,
  },
});

export default LightningSettingsScreen;
