import { Colors, TypographyPresets } from 'etta-ui';
import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Svg } from 'react-native-svg';
import { TContact } from '../utils/types';

interface Props {
  style?: ViewStyle;
  size?: number;
  contact: TContact;
}

const DEFAULT_ICON_SIZE = 40;

const getInitials = (alias: string) => alias.charAt(0).toLocaleUpperCase();

const ContactAvatar = ({ size, contact, style }: Props) => {
  const iconSize = size || DEFAULT_ICON_SIZE;
  const iconBackgroundColor = Colors.purple.base;

  const renderThumbnail = () => {
    if (contact.avatarUri) {
      return (
        <Image
          source={{ uri: contact.avatarUri }}
          style={[
            styles.image,
            { height: iconSize, width: iconSize, borderRadius: iconSize / 2.0 },
          ]}
          resizeMode={'cover'}
        />
      );
    }

    if (contact?.alias) {
      const initial = getInitials(contact?.alias);
      return (
        <Text
          allowFontScaling={false}
          style={[
            TypographyPresets.Body1,
            { fontSize: iconSize / 2.0, color: Colors.common.white },
          ]}
        >
          {initial.toLocaleUpperCase()}
        </Text>
      );
    }

    return <Svg width="40" height="40" viewBox="0 0 40 40" fill={iconBackgroundColor} />;
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.icon,
          {
            backgroundColor: iconBackgroundColor,
            height: iconSize,
            width: iconSize,
            borderRadius: iconSize / 2,
          },
        ]}
      >
        {renderThumbnail()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    margin: 'auto',
    alignSelf: 'center',
  },
});

export default ContactAvatar;
