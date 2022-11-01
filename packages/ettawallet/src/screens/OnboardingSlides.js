import React, { useContext } from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Cross, Safe } from '@ettawallet/rn-bitcoin-icons/dist/filled';
import GenericSlider from '../components/Slider';
import { testImage } from '../images/Images';
import colors from '../styles/colors';
import progressDots from '../styles/progressDots';
import { EttaStorageContext } from '../../storage/context';
import { navigate } from '../navigation/NavigationService';
import { useTranslation } from 'react-i18next';

const OnboardingSlides = () => {
  const { t } = useTranslation();
  const slides = [
    {
      key: 'slide-one',
      title: t('onboardingSlides.slide1.title'),
      text: t('onboardingSlides.slide1.text'),
      image: testImage, // will replace the icon placeholder
      backgroundColor: '#59b2ab',
    },
    {
      key: 'slide-two',
      title: t('onboardingSlides.slide2.title'),
      text: t('onboardingSlides.slide2.text'),
      image: testImage, // will replace the icon placeholder
      backgroundColor: '#febe29',
    },
    {
      key: 'slide-three',
      title: t('onboardingSlides.slide3.title'),
      text: t('onboardingSlides.slide3.text'),
      image: testImage, // will replace the icon placeholder
      backgroundColor: '#22bcb5',
    },
  ];

  const _renderItem = ({ item, index }) => {
    return (
      <View style={styles.itemContainer}>
        {index < 2 && (
          <TouchableOpacity
            style={styles.skip}
            onPress={() => navigate('Welcome')}
          >
            <Cross width={30} height={30} color="#000000" />
          </TouchableOpacity>
        )}
        <Safe
          width={80}
          height={80}
          color="#2D9CDB"
          style={{ alignSelf: 'center' }}
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.text}</Text>
      </View>
    );
  };
  const _keyExtractor = item => item.key;

  return (
    <GenericSlider
      keyExtractor={_keyExtractor}
      data={slides}
      showNextButton={true}
      showDoneButton={true}
      doneLabel={t('onboardingSlides.labels.done')}
      prevLabel={t('onboardingSlides.labels.previous')}
      nextLabel={t('onboardingSlides.labels.next')}
      onDone={() => navigate('WelcomeScreen')}
      dotStyle={progressDots.circlePassive}
      activeDotStyle={progressDots.circleActive}
      renderItem={_renderItem}
      showPrevButton
    />
  );
};

const styles = StyleSheet.create({
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'grey',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 320,
    height: 320,
  },
  itemContainer: {
    flex: 1,
    alignContent: 'space-between',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.onboardingBackground,
  },
  skip: { position: 'absolute', top: 20, left: 20 },
  title: {
    color: colors.primary,
    fontSize: 24,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: 'bold',
  },
  description: {
    color: colors.primary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default OnboardingSlides;
