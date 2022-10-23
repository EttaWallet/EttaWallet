import React from 'react';
import { StyleSheet, View } from 'react-native';
import { navigateBack } from '../NavigationService';
import { TopBarIconButton, TopBarIconButtonProps } from './TopBarButton';
import variables from '../../styles/variables';
import { ArrowLeft } from '@ettawallet/rn-bitcoin-icons/dist/filled';

type Props = Omit<TopBarIconButtonProps, 'icon'>;

const BackButton = (props: Props) => {
  return (
    <View style={styles.container}>
      <TopBarIconButton
        {...props}
        icon={<ArrowLeft color="#000" height={20} />}
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
