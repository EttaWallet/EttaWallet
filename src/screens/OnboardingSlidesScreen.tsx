import React from 'react';
import { navigate } from '../navigation/NavigationService';
import { useTranslation } from 'react-i18next';
import { Carousel } from 'etta-ui';
import { Screens } from '../navigation/Screens';
import { useStoreActions } from '../state/hooks';

const OnboardingSlidesScreen = () => {
  const setSeenSlides = useStoreActions((action) => action.nuxt.saveSeenSlides);
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

  const finishedSlides = () => {
    setSeenSlides(true);
    requestAnimationFrame(() => {
      navigate(Screens.WelcomeScreen);
    });
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
