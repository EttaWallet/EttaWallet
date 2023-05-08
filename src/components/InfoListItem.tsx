import * as React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Colors, Icon, ListItem, TypographyPresets } from 'etta-ui';
import Clipboard from '@react-native-clipboard/clipboard';
import Logger from '../utils/logger';
import { useTranslation } from 'react-i18next';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';

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
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{
                    fontSize: 20,
                  }}
                  onPress={onPressCopy}
                />
              ) : null}
              {showChevron ? (
                <Icon
                  name="icon-caret-right"
                  // eslint-disable-next-line react-native/no-inline-styles
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

type ExpandedInfoListItemProps = {
  details?: string;
} & BaseProps;

export const ExpandedInfoListItem = ({ title, details, onPress }: ExpandedInfoListItemProps) => {
  return (
    <Wrapper onPress={onPress}>
      <View style={styles.container}>
        <Title value={title} />
      </View>
      {details ? (
        <View>
          <Text style={styles.details}>{details}</Text>
        </View>
      ) : null}
    </Wrapper>
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
});
