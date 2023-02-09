import * as React from 'react';
import { DrawerItem as NavigationDrawerItem } from '@react-navigation/drawer';
import type { ExtractProps } from '../../utils/helpers';

type Props = ExtractProps<typeof NavigationDrawerItem>;

export default function DrawerItem(props: Props) {
  return <NavigationDrawerItem {...props} />;
}
