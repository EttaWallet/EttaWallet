import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import FormLabel from './form/Label';
import { Colors, TypographyPresets } from 'etta-ui';
import { InfoListItem } from './InfoListItem';

interface Props {
  decodedMetadata: string[][];
}

const JSONArrayRenderer: React.FC<Props> = ({ decodedMetadata }) => {
  const findContentByType = (type: string): string | null => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const item = decodedMetadata.find((item) => item[0] === type);
    return item ? item[1] : null;
  };

  const plainText = findContentByType('text/plain');
  const longText = findContentByType('text/long-desc');
  const identifier = findContentByType('text/identifier');
  return (
    // logic:
    // if "text/long-desc" exists, only render along with "text/identifier" if it also exists
    // only show "text/plain" if "text/long-desc doesn't exist" and if "text/plain" exists
    <View>
      {longText ? (
        <>
          {identifier && <InfoListItem title="Recipient" value={identifier} canCopy={true} />}
          <View style={styles.descContainer}>
            <FormLabel>Description</FormLabel>
            <Text style={styles.desc} selectable={true}>
              {longText}
            </Text>
          </View>
        </>
      ) : (
        <>
          {identifier && <InfoListItem title="Recipient" value={identifier} canCopy={true} />}
          {plainText && <InfoListItem title="Notes" value={plainText} canCopy={true} />}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  descContainer: {
    borderRadius: 4,
    backgroundColor: Colors.neutrals.light.neutral1,
    padding: 16,
    marginTop: 5,
  },
  desc: {
    ...TypographyPresets.Body5,
    color: Colors.neutrals.light.neutral7,
    paddingTop: 10,
  },
});

export default JSONArrayRenderer;
