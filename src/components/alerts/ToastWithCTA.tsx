import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageSourcePropType,
  Image,
  TextStyle,
  ImageStyle,
  ViewStyle,
  StyleProp,
  SafeAreaView,
} from 'react-native';
import { Button, Colors, TypographyPresets } from 'etta-ui';

const s = StyleSheet.create({
  container: {
    shadowColor: Colors.common.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,

    elevation: 10,

    backgroundColor: Colors.common.black,
    borderRadius: 8,
    marginTop: 10,
    marginHorizontal: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    alignItems: 'center',
    marginRight: 5,
    borderRadius: 5,
    height: 45,
    width: 45,
  },
  content: {
    flex: 1,
    marginHorizontal: 5,
  },
  title: {
    ...TypographyPresets.Header5,
    color: Colors.common.white,
  },
  description: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral1,
  },
});

export interface NotificationComponentProps {
  /** Passed to `<Image />` as `source` param.
   * @default null */
  imageSource?: ImageSourcePropType;

  /** The maximum number of lines to use for rendering title.
   * @default null */
  maxTitleLines?: number;

  /** The maximum number of lines to use for rendering description.
   * @default null */
  maxDescriptionLines?: number;

  /** A container of the component. Set it in case you use different SafeAreaView than the standard
   * @default SafeAreaView */
  ContainerComponent?: React.ElementType;

  /** The style to use for rendering title
   * @default null */
  titleStyle?: StyleProp<TextStyle>;

  /** The style to use for rendering description
   * @default null */
  descriptionStyle?: StyleProp<TextStyle>;

  /** The style to use for notification container.
   * Might be useful to change background color, shadows, paddings or margins
   * @default null */
  containerStyle?: StyleProp<ViewStyle>;

  /** The style to use for rendering image
   * @default null */
  imageStyle?: StyleProp<ImageStyle>;
}

interface NotificationComponentAllProps extends NotificationComponentProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonStyle?: StyleProp<TextStyle>;
  buttonAction?(): void;
}

const ToastWithCTA: React.FunctionComponent<NotificationComponentAllProps> = ({
  title,
  titleStyle,
  description,
  descriptionStyle,
  buttonLabel,
  buttonStyle,
  buttonAction,
  imageSource,
  imageStyle,
  ContainerComponent,
  maxTitleLines,
  maxDescriptionLines,
  containerStyle,
}) => {
  const Container = ContainerComponent ?? SafeAreaView;
  return (
    <Container>
      <View style={[s.container, containerStyle]}>
        {!!imageSource && <Image style={[s.image, imageStyle]} source={imageSource} />}
        <View style={s.content}>
          {!!title && (
            <Text style={[s.title, titleStyle]} numberOfLines={maxTitleLines}>
              {title}
            </Text>
          )}
          {!!description && (
            <Text style={[s.description, descriptionStyle]} numberOfLines={maxDescriptionLines}>
              {description}
            </Text>
          )}
          {!!buttonLabel && (
            <Button
              title={buttonLabel ? buttonLabel : 'Resolve'}
              size="small"
              appearance="outline"
              style={buttonStyle}
              onPress={buttonAction}
            />
          )}
        </View>
      </View>
    </Container>
  );
};

export default ToastWithCTA;
