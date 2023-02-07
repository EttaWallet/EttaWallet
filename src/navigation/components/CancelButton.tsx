import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from 'etta-ui';

const CancelButton = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="icon-caret-left" style={{ paddingRight: 8, fontSize: 20 }} />
      <Text style={{ fontSize: 18, lineHeight: 18, fontWeight: '500' }}>
        Back
      </Text>
    </View>
  );
};

export default CancelButton;
