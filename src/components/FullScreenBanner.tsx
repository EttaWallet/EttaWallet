import * as React from 'react';
import { StyleSheet, Text, View, Dimensions, SafeAreaView } from 'react-native';
import { Button, TypographyPresets, Colors, Icon } from 'etta-ui';

export interface Props {
  title: string;
  CTAText: string;
  CTAHandler: () => void;
  subtitle?: string | null;
  children: React.ReactNode;
}

const { height, width } = Dimensions.get('window');

class FullScreenBanner extends React.PureComponent<Props> {
  render() {
    const { title, subtitle, CTAText, CTAHandler } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.iconContainer}>
          <Icon name="icon-alert" style={styles.errorIcon} />
        </View>
        <View style={styles.header}>
          <Text style={{ ...TypographyPresets.Header3, color: Colors.red.base }}>{title}</Text>
          <Text
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              ...TypographyPresets.Body4,
              color: Colors.neutrals.light.neutral7,
              paddingBottom: 20,
              textAlign: 'center',
            }}
          >
            {subtitle}
          </Text>
        </View>
        {this.props.children}
        <View style={styles.button}>
          <Button onPress={CTAHandler} title={CTAText} appearance="filled" size="block" />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.common.white,
    height: height,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  errorIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 52,
    color: Colors.common.white,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: Colors.red.base,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: { alignItems: 'center', paddingTop: 50 },
});

export default FullScreenBanner;
