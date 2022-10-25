import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import { navigateBack } from '../navigation/NavigationService';
import {
  TopBarIconButton,
  TopBarIconButtonProps,
} from '../navigation/headers/TopBarButton';
import variables from '../styles/variables';

type Props = Omit<TopBarIconButtonProps, 'icon'>;

const BackButton = (props: Props) => {
  return (
    <View style={styles.container}>
      <TopBarIconButton
        {...props}
        icon={<ArrowLeft width={20} height={20} color="#000" />}
      />
    </View>
  );
};

BackButton.defaultProps = {
  onPress: navigateBack,
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: variables.contentPadding + 6, // 6px from the left padding
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackButton;
