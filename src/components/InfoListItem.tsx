/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { Platform, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Colors, Icon, ListItem, TypographyPresets, ValueOf } from 'etta-ui';
import Clipboard from '@react-native-clipboard/clipboard';
import Logger from '../utils/logger';
import { useTranslation } from 'react-i18next';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { iconVars } from 'etta-ui/lib/typescript/components/icon/icon.vars';

interface WrapperProps {
  onPress?: () => void;
  children: React.ReactNode;
}

function Wrapper({ onPress, children }: WrapperProps) {
  return <ListItem onPress={onPress}>{children}</ListItem>;
}

function Title({ value }: { value: string }) {
  return <View style={[styles.left]}>{<Text style={styles.title}>{value}</Text>}</View>;
}

function maskString(item: string): string {
  const firstFour = item.slice(0, 4);
  const lastFour = item.slice(-4);
  return `${firstFour}...${lastFour}`;
}

type BaseProps = {
  title: string;
} & Omit<WrapperProps, 'children'>;

type InfoListItemProps = {
  value?: string | number;
  showChevron?: boolean;
  highlightValue?: boolean;
  valueIsNumeric?: boolean;
  canCopy?: boolean;
  maskValue?: boolean;
} & BaseProps;

export const InfoListItem = ({
  title,
  value,
  showChevron,
  onPress,
  highlightValue,
  valueIsNumeric,
  canCopy,
  maskValue,
}: InfoListItemProps) => {
  const { t } = useTranslation();

  const onPressCopy = () => {
    Clipboard.setString(value?.toString() || '');
    Logger.showMessage(t(`${title} copied to clipboard`));
    cueInformativeHaptic();
  };

  return (
    <Wrapper onPress={onPress}>
      <View style={styles.container}>
        <Title value={title} />
        <View style={styles.row}>
          {value ? (
            <>
              <Text
                style={
                  highlightValue
                    ? styles.highlightValue
                    : valueIsNumeric
                    ? styles.numeric
                    : styles.value
                }
              >
                {maskValue ? maskString(value.toString()) : value}
              </Text>
              {valueIsNumeric ? <Text>sats</Text> : null}
              {canCopy ? (
                <Icon
                  name="icon-copy"
                  style={{
                    fontSize: 20,
                  }}
                  onPress={onPressCopy}
                />
              ) : null}
              {showChevron ? (
                <Icon
                  name="icon-caret-right"
                  style={{
                    fontSize: 20,
                    color: highlightValue ? '#F7931A' : undefined,
                  }}
                />
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </Wrapper>
  );
};

type ListItemWithIconProps = {
  subtitle?: string;
  withIcon?: boolean;
  icon?: ValueOf<typeof iconVars.names>;
} & BaseProps;

export const ListItemWithIcon = ({
  title,
  subtitle,
  icon,
  withIcon,
  onPress,
}: ListItemWithIconProps) => {
  return (
    <TouchableWithoutFeedback disabled={false} onPress={onPress}>
      <View style={styles.withIconContainer}>
        {withIcon ? (
          <View style={styles.iconContainer}>
            <Icon name={icon!} style={styles.sendIcon} />
          </View>
        ) : null}
        <View style={styles.withIconContent}>
          <Text style={[styles.withIconTitle, !subtitle ? { justifyContent: 'center' } : null]}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.withIconSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const fontFamilyChoice = Platform.OS === 'ios' ? 'Menlo-Regular' : 'monospace';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  left: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    ...TypographyPresets.Body4,
    color: Colors.common.black,
  },
  value: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    marginRight: 8,
  },
  highlightValue: {
    ...TypographyPresets.Body4,
    color: Colors.orange.base,
    marginRight: 8,
  },
  numeric: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    marginRight: 5,
    fontFamily: fontFamilyChoice,
  },
  details: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral6,
    paddingRight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  withIconContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 12,
  },
  withIconContent: {
    flex: 1,
    flexGrow: 1,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  withIconTitle: {
    ...TypographyPresets.Body4,
    flexShrink: 1,
  },
  withIconSubtitle: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
  },
  sendIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 25,
    color: Colors.orange.base,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'rgba(247, 147, 26, 0.2)',
  },
});
