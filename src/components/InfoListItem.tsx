/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Colors, Icon, Switch, TypographyPresets, ValueOf } from 'etta-ui';
import Clipboard from '@react-native-clipboard/clipboard';
import Logger from '../utils/logger';
import { useTranslation } from 'react-i18next';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { iconVars } from 'etta-ui/lib/typescript/components/icon/icon.vars';
import { maskString } from '../utils/helpers';
import ListItem from './ListItem';

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
                {maskValue ? maskString(value.toString(), 4) : value}
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
                    color: highlightValue ? Colors.orange.base : undefined,
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
            <Icon name={icon!} style={styles.listIcon} />
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

type SettingsItemWithIconProps = {
  subtitle?: string;
  withIcon?: boolean;
  icon?: ValueOf<typeof iconVars.names>;
} & BaseProps;

export const SettingsItemWithIcon = ({
  title,
  subtitle,
  icon,
  withIcon,
  onPress,
}: SettingsItemWithIconProps) => {
  return (
    <TouchableWithoutFeedback disabled={false} onPress={onPress}>
      <View style={styles.settingsContainer}>
        {withIcon ? (
          <View style={styles.settingsIconContainer}>
            <Icon name={icon!} style={styles.settingsIcon} />
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

type SettingsItemWithTextValueProps = {
  value?: string;
  withChevron?: boolean;
} & BaseProps;

export const SettingsItemWithTextValue = ({
  title,
  value,
  withChevron,
  onPress,
}: SettingsItemWithTextValueProps) => {
  return (
    <Wrapper onPress={onPress}>
      <View style={styles.container}>
        <Title value={title} />
        <View style={styles.right}>
          {value && <Text style={styles.value}>{value}</Text>}
          {withChevron && (
            <View style={styles.iconTextContainer}>
              <Icon name="icon-caret-right" style={styles.icon} />
            </View>
          )}
        </View>
      </View>
    </Wrapper>
  );
};

type SettingsItemSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  details?: string;
} & Omit<BaseProps, 'onPress'>;

export function SettingsItemSwitch({
  title,
  onValueChange,
  value,
  details,
}: SettingsItemSwitchProps) {
  return (
    <Wrapper>
      <View style={styles.container}>
        <Title value={title} />
        <View style={styles.iconTextContainer}>
          <Switch value={value} onValueChange={onValueChange} />
        </View>
      </View>
      {details && (
        <View>
          <Text style={styles.details}>{details}</Text>
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: Colors.green.base,
    marginRight: 8,
  },
  numeric: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    marginRight: 5,
  },
  details: {
    ...TypographyPresets.Body4,
    color: Colors.neutrals.light.neutral7,
    paddingRight: 16,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  withIconContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 8,
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
  listIcon: {
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
  settingsContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.light.neutral1,
  },
  settingsIconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: Colors.neutrals.light.neutral3,
  },
  settingsIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.black,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconTextContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: Colors.common.black,
  },
});
