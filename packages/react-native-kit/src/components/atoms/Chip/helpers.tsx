import color from 'color';
import { ThemeProp } from '@ettawallet/react-core';
import type { ColorValue } from 'react-native';

type BaseProps = {
  theme: ThemeProp;
  isOutlined: boolean;
  disabled?: boolean;
};

const getBorderColor = ({
  theme,
  disabled,
  selectedColor,
}: BaseProps & { backgroundColor: string; selectedColor?: string }) => {
  const isSelectedColor = selectedColor !== undefined;

  if (disabled) {
    return color(theme.color.primary.neutral8).alpha(0.12).rgb().string();
  }

  if (isSelectedColor) {
    return color(selectedColor).alpha(0.29).rgb().string();
  }

  return theme.color.primary.neutral4;
};

const getTextColor = ({
  theme,
  isOutlined,
  disabled,
  selectedColor,
}: BaseProps & {
  selectedColor?: string;
}) => {
  const isSelectedColor = selectedColor !== undefined;
  if (disabled) {
    return theme.color.primary.neutral8;
  }

  if (isSelectedColor) {
    return selectedColor;
  }

  if (isOutlined) {
    return theme.color.primary.black;
  }

  return theme.color.primary.neutral2;
};

const getDefaultBackgroundColor = ({
  theme,
  isOutlined,
}: Omit<BaseProps, 'disabled' | 'selectedColor'>) => {
  if (isOutlined) {
    return theme.color.primary.neutral4;
  }

  return theme.color.primary.neutral4;
};

const getBackgroundColor = ({
  theme,
  isOutlined,
  disabled,
  customBackgroundColor,
}: BaseProps & {
  customBackgroundColor?: ColorValue;
}) => {
  if (typeof customBackgroundColor === 'string') {
    return customBackgroundColor;
  }

  if (disabled) {
    if (isOutlined) {
      return 'transparent';
    }
    return color(theme.color.primary.neutral8).alpha(0.12).rgb().string();
  }

  return getDefaultBackgroundColor({ theme, isOutlined });
};

const getSelectedBackgroundColor = ({
  theme,
  isOutlined,
  disabled,
  customBackgroundColor,
  showSelectedOverlay,
}: BaseProps & {
  customBackgroundColor?: ColorValue;
  showSelectedOverlay?: boolean;
}) => {
  const backgroundColor = getBackgroundColor({
    theme,
    disabled,
    isOutlined,
    customBackgroundColor,
  });

  if (isOutlined) {
    if (showSelectedOverlay) {
      return color(backgroundColor)
        .mix(color(theme.color.primary.neutral8), 0.12)
        .rgb()
        .string();
    }
    return color(backgroundColor)
      .mix(color(theme.color.primary.neutral8), 0)
      .rgb()
      .string();
  }

  if (showSelectedOverlay) {
    return color(backgroundColor)
      .mix(color(theme.color.primary.neutral2), 0.12)
      .rgb()
      .string();
  }

  return color(backgroundColor)
    .mix(color(theme.color.primary.neutral2), 0)
    .rgb()
    .string();
};

const getIconColor = ({
  theme,
  isOutlined,
  disabled,
  selectedColor,
}: BaseProps & {
  selectedColor?: string;
}) => {
  const isSelectedColor = selectedColor !== undefined;
  if (disabled) {
    return theme.color.primary.neutral2;
  }

  if (isSelectedColor) {
    return selectedColor;
  }

  if (isOutlined) {
    return theme.color.primary.neutral8;
  }

  return theme.color.primary.neutral2;
};

const getUnderlayColor = ({
  theme,
  isOutlined,
  disabled,
  selectedColor,
  selectedBackgroundColor,
}: BaseProps & { selectedBackgroundColor: string; selectedColor?: string }) => {
  const isSelectedColor = selectedColor !== undefined;
  const textColor = getTextColor({
    theme,
    disabled,
    selectedColor,
    isOutlined,
  });

  if (isSelectedColor) {
    return color(selectedColor).alpha(0.12).rgb().string();
  }

  return color(textColor).alpha(0.12).rgb().string();
};

export const getChipColors = ({
  isOutlined,
  theme,
  selectedColor,
  showSelectedOverlay,
  customBackgroundColor,
  disabled,
}: BaseProps & {
  customBackgroundColor?: ColorValue;
  disabled?: boolean;
  showSelectedOverlay?: boolean;
  selectedColor?: string;
}) => {
  const baseChipColorProps = { theme, isOutlined, disabled };

  const backgroundColor = getBackgroundColor({
    ...baseChipColorProps,
    customBackgroundColor,
  });

  const selectedBackgroundColor = getSelectedBackgroundColor({
    ...baseChipColorProps,
    customBackgroundColor,
    showSelectedOverlay,
  });

  return {
    borderColor: getBorderColor({
      ...baseChipColorProps,
      selectedColor,
      backgroundColor,
    }),
    textColor: getTextColor({
      ...baseChipColorProps,
      selectedColor,
    }),
    iconColor: getIconColor({
      ...baseChipColorProps,
      selectedColor,
    }),
    underlayColor: getUnderlayColor({
      ...baseChipColorProps,
      selectedColor,
      selectedBackgroundColor,
    }),
    backgroundColor,
    selectedBackgroundColor,
  };
};
