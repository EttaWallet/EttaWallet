import React from 'react';
import { StyleSheet, View } from 'react-native';
import { navigateBack } from '../NavigationService';
import {
  TopBarIconTextButtonProps,
  TopBarTextIconButton,
} from './TopBarButton';
import variables from '../../styles/variables';
import BackChevron, {
  Props as BackChevronProps,
} from '../../icons/BackChevron';

type Props = Omit<TopBarIconTextButtonProps, 'icon'> & BackChevronProps;

const BackButton = (props: Props) => {
  return (
    <View style={styles.container}>
      <TopBarTextIconButton
        {...props}
        icon={<BackChevron color={props.color} height={props.height} />}
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
