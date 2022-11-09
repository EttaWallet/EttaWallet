import React from 'react';
import BackButton from '../../components/BackButton';
import CustomHeader from './CustomHeader';

// TODO: Replace request header also & add translations for both
const HeaderWithBackButton = () => {
  return <CustomHeader left={<BackButton />} />;
};

export default HeaderWithBackButton;
