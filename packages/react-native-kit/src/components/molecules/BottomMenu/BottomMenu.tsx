import * as React from 'react';
import { ViewProps } from 'react-native';
import { StyledView, TabContainer } from './styled';
import Item, { BottomMenuItemProps } from './Item';
import { Text } from '../../atoms/Text';

export interface BottomMenuProps<T extends string | number | symbol>
  extends ViewProps {
  selected: T;
  onSelect: (value: T) => void | never;
  children:
    | React.ReactElement<BottomMenuItemProps<T>>
    | React.ReactElement<BottomMenuItemProps<T>>[];
}

function BottomMenu<T extends string | number | symbol>({
  selected,
  onSelect,
  children,
  ...rest
}: BottomMenuProps<T>): JSX.Element {
  return (
    <StyledView {...rest}>
      {React.Children.map(children, child => {
        const { value, label, labelProps, labelElement } = (
          child as React.ReactElement<BottomMenuItemProps<T>>
        ).props;
        const isSelected = value == selected;

        return (
          <TabContainer selected={isSelected} onPress={() => onSelect(value)}>
            {React.cloneElement(child as React.ReactElement, {
              _selected: isSelected,
            })}
            {label && !labelElement && (
              <Text
                colorVariant={
                  labelProps?.colorVariant || isSelected
                    ? 'primary'
                    : 'secondary'
                }
                typography={labelProps?.typography || 'sub'}
                {...labelProps}
              >
                {label}
              </Text>
            )}
            {labelElement && labelElement}
          </TabContainer>
        );
      })}
    </StyledView>
  );
}

BottomMenu.Item = Item;

export default BottomMenu;
