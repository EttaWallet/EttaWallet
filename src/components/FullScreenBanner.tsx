import * as React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button, TypographyPresets, Colors, Icon } from 'etta-ui';
import { SafeAreaView, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { ErrorCategory } from '../utils/types';

interface Props {
  category: ErrorCategory;
  title: string;
  description: string;
  solution?: string;
  primaryCTALabel: string;
  primaryCTA(): void;
  secondaryCTALabel?: string;
  secondaryCTA?(): void;
  tertiaryCTALabel?: string;
  tertiaryCTA?(): void;
  showSuggestions?: boolean;
}

const FullScreenBanner = ({
  category,
  title,
  description,
  primaryCTALabel,
  primaryCTA,
  secondaryCTALabel,
  secondaryCTA,
  tertiaryCTALabel,
  tertiaryCTA,
  showSuggestions,
}: Props) => {
  const displayIcon = React.useMemo(() => {
    switch (category) {
      default:
      case ErrorCategory.INFO:
        return (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.blue.base,
              },
            ]}
          >
            <Icon name="icon-info" style={styles.icon} />
          </View>
        );
      case ErrorCategory.WARNING:
        return (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.blue.base,
              },
            ]}
          >
            <Icon name="icon-alert" style={styles.icon} />
          </View>
        );
      case ErrorCategory.ERROR:
        return (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: Colors.red.base,
              },
            ]}
          >
            <Icon name="icon-cross" style={styles.icon} />
          </View>
        );
    }
  }, [category]);

  const suggestions = [
    "Are you trying to pay an invoice you created? That won't work",
    'Are you trying to pay an invoice that was already settled?',
    'Are you connected to the internet?',
    'Wait 2 minutes and try again',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <>
          <View>{displayIcon}</View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          {showSuggestions ? (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsHeader}>A few things to try or check:</Text>
              {suggestions.map((suggestion) => (
                <View
                  style={{
                    paddingVertical: 8,
                    borderTopWidth: 1,
                    borderTopColor: Colors.neutrals.light.neutral4,
                  }}
                >
                  <Text style={styles.suggestion}>{suggestion}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      </ScrollView>
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <>
            <Button
              onPress={primaryCTA}
              title={primaryCTALabel}
              appearance="filled"
              style={[
                styles.button,
                (insets && insets.bottom <= 40 && secondaryCTALabel) || tertiaryCTALabel
                  ? { marginBottom: 10 }
                  : { marginBottom: 40 },
              ]}
            />
            {secondaryCTALabel ? (
              <Button
                onPress={secondaryCTA}
                title={secondaryCTALabel!}
                appearance="outline"
                // eslint-disable-next-line react-native/no-inline-styles
                style={[styles.button, insets && insets.bottom <= 40 && { marginBottom: 10 }]}
              />
            ) : null}
            {tertiaryCTALabel ? (
              <Button
                onPress={tertiaryCTA}
                title={tertiaryCTALabel!}
                appearance="outline"
                // eslint-disable-next-line react-native/no-inline-styles
                style={[styles.button, insets && insets.bottom <= 40 && { marginBottom: 10 }]}
              />
            ) : null}
          </>
        )}
      </SafeAreaInsetsContext.Consumer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    ...TypographyPresets.Header4,
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.common.black,
  },
  description: {
    ...TypographyPresets.Body4,
    textAlign: 'center',
    color: Colors.neutrals.light.neutral7,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsHeader: {
    ...TypographyPresets.Body4,
    textAlign: 'center',
    color: Colors.common.black,
    paddingBottom: 10,
  },
  suggestion: {
    ...TypographyPresets.Body4,
    textAlign: 'center',
    color: Colors.neutrals.light.neutral7,
  },
  button: {
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 30,
    color: Colors.common.white,
  },
  iconContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default FullScreenBanner;
