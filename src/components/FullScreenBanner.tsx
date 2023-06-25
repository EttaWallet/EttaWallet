import * as React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Button, TypographyPresets, Colors, Icon } from 'etta-ui';
import { SafeAreaView, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { ErrorCategory, TransactionState } from '../utils/types';
import LottieView from 'lottie-react-native';

interface Props {
  category: ErrorCategory | TransactionState;
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
      case TransactionState.Success:
        return (
          <LottieView
            style={styles.lottieIcon}
            source={require('../../assets/lottie/success-transaction.json')}
            autoPlay={true}
            loop={false}
          />
        );
    }
  }, [category]);

  const suggestions = {
    0: "Are you trying to pay an invoice you created? That won't work",
    1: 'Are you trying to pay an invoice that was already settled?',
    2: 'Are you connected to the internet?',
    3: 'Wait 2 minutes and try again',
    4: 'Ask for support on Discord',
  };

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
              {Object.entries(suggestions).map(([key, value]) => (
                <View
                  key={key}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{
                    paddingVertical: 8,
                    borderTopWidth: 1,
                    borderTopColor: Colors.neutrals.light.neutral4,
                  }}
                >
                  <Text style={styles.suggestion}>{value}</Text>
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
                style={[styles.button, insets && insets.bottom <= 40 && { marginBottom: 40 }]}
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
    marginHorizontal: 24,
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
  lottieIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: '75%',
    aspectRatio: 1,
  },
});

export default FullScreenBanner;
