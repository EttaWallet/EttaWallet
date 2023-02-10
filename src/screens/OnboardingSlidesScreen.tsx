import React from 'react';
import { useEttaStorageContext } from '../storage/context';
import { navigate } from '../navigation/NavigationService';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_SLIDES_COMPLETED } from '../storage/constants';
import { Carousel } from 'etta-ui';
import { Screens } from '../navigation/Screens';

const OnboardingSlidesScreen = () => {
  const { setCompletedOnboardingSlides } = useEttaStorageContext();
  const { t } = useTranslation();

  // Define slides
  const slides = [
    {
      title: t('onboardingSlides.slide1.title'),
      text: t('onboardingSlides.slide1.text'),
      icon: 'icon-wallet-2',
      iconBg: '#27AE60',
    },
    {
      title: t('onboardingSlides.slide2.title'),
      text: t('onboardingSlides.slide2.text'),
      icon: 'icon-cloud',
      iconBg: '#BB6BD9',
    },
    {
      title: t('onboardingSlides.slide3.title'),
      text: t('onboardingSlides.slide3.text'),
      icon: 'icon-safe',
      iconBg: '#2D9CDB',
    },
  ];

  const markSlidesSeen = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_SLIDES_COMPLETED, 'true');
    } catch (e) {
      console.log('something went wrong here');
    }
  };

  const finishedSlides = () => {
    setCompletedOnboardingSlides(true);
    markSlidesSeen(); // save to disk
    navigate(Screens.WelcomeScreen);
  };

  return (
    <Carousel
      stepInfo={slides}
      embeddedNavBar={false}
      buttonText="Next"
      finalButtonText="Continue"
      onFinish={finishedSlides}
      onCancel={() => 0}
    />
  );
};

export default OnboardingSlidesScreen;
