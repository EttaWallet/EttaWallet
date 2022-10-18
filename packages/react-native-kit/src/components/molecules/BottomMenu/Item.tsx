import * as React from 'react';
import { Icon, IconProps } from '@ettawallet/react-core';
import { TabContent, CustomTabContent } from './styled';
import { ViewProps } from 'react-native';
import { TextNativeProps } from '../../atoms/Text';

type ValueType = string | number | symbol;

export interface BottomMenuItemProps<T extends ValueType>
  extends Omit<ViewProps, 'children'> {
  _selected?: boolean;
  value: T;
  icon: IconProps;
  label?: string;
  labelProps?: TextNativeProps;
  labelElement?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}

type ItemPropsWithIcon<T extends ValueType> = Omit<
  BottomMenuItemProps<T>,
  'children'
>;

type ItemPropsWithChildren<T extends ValueType> = Omit<
  BottomMenuItemProps<T>,
  'icon' | 'label' | 'labelElement' | 'labelProps'
>;

function Item<T extends ValueType>(props: ItemPropsWithChildren<T>);
function Item<T extends ValueType>(props: ItemPropsWithIcon<T>);
function Item<T extends ValueType>({
  _selected,
  icon,
  children,
  ...rest
}: Partial<BottomMenuItemProps<T>>): JSX.Element {
  const styledButtonStyle = _selected
    ? undefined
    : { backgroundColor: 'transparent' };

  const iconColorVariant = _selected ? 'primary' : 'secondary';

  if (icon) {
    return (
      <TabContent style={styledButtonStyle} {...rest}>
        <Icon colorVariant={iconColorVariant} size={'centi'} {...icon} />
      </TabContent>
    );
  } else {
    return <CustomTabContent>{children}</CustomTabContent>;
  }
}

export default Item;
