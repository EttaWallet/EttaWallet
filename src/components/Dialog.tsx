import * as React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Modal from './Modal';
import { Button, Colors, TypographyPresets } from 'etta-ui';

interface Props {
  image?: ImageSourcePropType;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  actionText?: string | null;
  isActionHighlighted?: boolean;
  actionPress?: () => void;
  secondaryActionText?: string | null;
  secondaryActionDisabled?: boolean;
  secondaryActionPress?: () => void;
  isVisible: boolean;
  showLoading?: boolean;
  onBackgroundPress?: () => void;
}

const Dialog = ({
  title,
  children,
  actionPress,
  actionText,
  isActionHighlighted = true,
  secondaryActionText,
  secondaryActionDisabled,
  secondaryActionPress,
  showLoading = false,
  image,
  isVisible,
  onBackgroundPress,
}: Props) => {
  return (
    <Modal isVisible={isVisible} onBackgroundPress={onBackgroundPress}>
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        {image && <Image style={styles.imageContainer} source={image} resizeMode="contain" />}
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.body}>{children}</Text>
      </ScrollView>
      <View style={styles.actions}>
        {secondaryActionText && (
          <Button
            title={secondaryActionText}
            style={styles.secondary}
            disabled={secondaryActionDisabled}
            onPress={secondaryActionPress}
            appearance="transparent"
          />
        )}
        {showLoading ? (
          <ActivityIndicator style={styles.primary} size="small" color={Colors.green.base} />
        ) : (
          <>
            {actionText && (
              <Button
                title={actionText}
                style={isActionHighlighted ? styles.primary : styles.secondary}
                onPress={actionPress}
                appearance="outline"
                size="small"
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    ...TypographyPresets.Header4,
  },
  body: {
    textAlign: 'center',
    ...TypographyPresets.Body4,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    maxWidth: '100%',
    flexWrap: 'wrap',
  },
  secondary: {
    color: Colors.neutrals.light.neutral3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginBottom: 12,
    width: 100,
    height: 100,
  },
});

export default Dialog;
