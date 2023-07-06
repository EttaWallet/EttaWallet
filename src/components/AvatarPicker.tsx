import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { getDataURL } from '../utils/images';
import Logger from '../utils/logger';
import OptionsActionSheet from './OptionsActionSheet';
import { Colors, Icon } from 'etta-ui';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ContactAvatar from './ContactAvatar';
import { TContact } from '../utils/types';

const AVATAR_SIZE = 64;

interface Props {
  avatar: string | null;
  onImageChosen: (dataUrl: string | null) => void;
  contact?: TContact;
}

const AvatarPicker = ({ avatar, onImageChosen, contact }: Props) => {
  const [showOptions, setShowOptions] = useState(false);
  const updateShowOptions = (show: boolean) => () => setShowOptions(show);

  const { t } = useTranslation();

  const pickPhoto = async (pickerFunction: typeof ImagePicker.openPicker) => {
    try {
      const image = await pickerFunction({
        width: 150,
        height: 150,
        cropping: true,
        includeBase64: true,
        cropperCircleOverlay: true,
        cropperChooseText: t('choose') ?? undefined,
        cropperCancelText: t('cancel') ?? undefined,
      });
      if (image) {
        //@ts-ignore
        onImageChosen(getDataURL(image.mime, image.data));
      }
    } catch (e) {
      const MISSING_PERMISSION_ERR_MSG = 'Required permission missing';
      const USER_CANCELLED_ERR_MSG = 'User cancelled image selection';
      if (
        e.message.includes(USER_CANCELLED_ERR_MSG) ||
        e.message.includes(MISSING_PERMISSION_ERR_MSG)
      ) {
        Logger.info('@AvatarPicker', e.message);
        return;
      }

      Logger.error('@AvatarPicker', 'Error while fetching image from picker', e);
    }
  };

  const onOptionChosen = async (buttonIndex: number) => {
    setShowOptions(false);
    // Give time for the modal to close when using Android or the
    // picker/camera will close instantly.
    setTimeout(
      async () => {
        if (buttonIndex === 0) {
          await pickPhoto(ImagePicker.openPicker);
        } else if (buttonIndex === 1) {
          await pickPhoto(ImagePicker.openCamera);
        } else if (buttonIndex === 2) {
          onImageChosen(null);
        }
      },
      Platform.OS === 'android' ? 500 : 0
    );
  };

  const showRemoveOption = !!avatar;

  return (
    <>
      <TouchableOpacity style={[styles.container]} onPress={updateShowOptions(true)}>
        <>
          <ContactAvatar size={AVATAR_SIZE} contact={contact!} />
          <View style={styles.editIconContainer}>
            <Icon name="icon-edit" />
          </View>
        </>
      </TouchableOpacity>
      <OptionsActionSheet
        isVisible={showOptions}
        options={[
          'Choose from Photo Library',
          'Take Photo with Camera',
          showRemoveOption ? 'Remove avatar' : '',
        ].filter((option) => option.length > 0)}
        includeCancelButton={true}
        isLastOptionDestructive={showRemoveOption}
        onOptionChosen={onOptionChosen}
        onCancel={updateShowOptions(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    width: 30,
    height: 30,
    position: 'absolute',
    left: 37,
    bottom: -13,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.light.neutral1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AvatarPicker;
