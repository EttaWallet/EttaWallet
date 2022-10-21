import * as React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Touchable from '../../components/Touchable';
import colors from '../../styles/colors';
import fontStyles from '../../styles/fonts';
import { Spacing } from '../../styles/styles';
import variables from '../../styles/variables';

interface CommonProps {
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

type WrapperProps = CommonProps & {
  children: JSX.Element;
};

function Wrapper({ onPress, disabled, children, style }: WrapperProps) {
  const onPressLocal = React.useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <Touchable
      disabled={disabled}
      onPress={onPressLocal}
      borderless={true}
      hitSlop={variables.iconHitslop}
      style={style}
    >
      {children}
    </Touchable>
  );
}

export type TopBarIconButtonProps = CommonProps & {
  icon: JSX.Element;
};

export function TopBarIconButton(props: TopBarIconButtonProps) {
  return <Wrapper {...props}>{props.icon}</Wrapper>;
}

export type TopBarTextButtonProps = CommonProps & {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
};

export function TopBarTextButton(props: TopBarTextButtonProps) {
  const { titleStyle, title } = props;
  return (
    <Wrapper {...props}>
      <Text style={titleStyle ? [styles.text, titleStyle] : styles.text}>
        {title}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  text: {
    ...fontStyles.regular,
    color: colors.greenUI,
    paddingHorizontal: Spacing.Thick24,
  },
});
