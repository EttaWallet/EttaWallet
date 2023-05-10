/* eslint-disable no-fallthrough */
import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Platform, Text, View } from 'react-native';
import { noHeader } from '../navigation/Headers';
import { StackParamList } from '../navigation/types';
import { Screens } from '../navigation/Screens';
import { SafeAreaView, useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Defs, Mask, Rect, Svg } from 'react-native-svg';
import { Camera as CameraKit, CameraType } from 'react-native-camera-kit';
import { Colors, TypographyPresets } from 'etta-ui';
import CancelButton from '../navigation/components/CancelButton';
import { navigateBack } from '../navigation/NavigationService';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { cueInformativeHaptic } from '../utils/accessibility/haptics';
import { processInputData } from '../utils/lightning/decode';

type RouteProps = NativeStackScreenProps<StackParamList, Screens.ScanQRCodeScreen>;

interface ScannerScreenProps {
  onDataFound: (data: string) => void;
}
type Props = ScannerScreenProps & RouteProps;

const QrCodeFrame = () => {
  const { width, height } = useSafeAreaFrame();

  const frameWidth = 40;
  const framePerimeter = width - frameWidth * 2;
  const frameBorderRadius = 8;

  return (
    <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <Mask id="mask" x="0" y="0" height="100%" width="100%">
          <Rect height="100%" width="100%" fill="#fff" />
          <Rect
            x={frameWidth}
            y={(height - framePerimeter) / 2}
            rx={frameBorderRadius}
            ry={frameBorderRadius}
            width={framePerimeter}
            height={framePerimeter}
            fill="#000"
          />
        </Mask>
      </Defs>
      <Rect height="100%" width="100%" fill="rgba(0,0,0,0.5)" mask="url(#mask)" />
    </Svg>
  );
};

const ScanActionsBar = () => {
  const onClose = () => {
    cueInformativeHaptic();
    navigateBack();
  };
  return (
    <SafeAreaView style={styles.actionsContainer} edges={['top']}>
      <View style={styles.cancel}>
        <CancelButton onCancel={onClose} />
      </View>
    </SafeAreaView>
  );
};

const ScanQRCodeScreen = ({}: Props) => {
  const inset = useSafeAreaInsets();

  enum CameraStatus {
    AUTHORIZED = 'AUTHORIZED',
    NOT_AUTHORIZED = 'NOT_AUTHORIZED',
    UNKNOWN = 'UNKNOWN',
  }

  const [cameraAccess, setCameraAccess] = useState<CameraStatus>(CameraStatus.UNKNOWN);
  const [scannedData, setScannedData] = useState('');

  useEffect(() => {
    (async (): Promise<void> => {
      const cameraPermission =
        Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
      const checkResponse = await check(cameraPermission);
      switch (checkResponse) {
        // Camera is not available (on this device / in this context
        case RESULTS.UNAVAILABLE:
        // Camera permission is denied and not requestable anymore
        case RESULTS.BLOCKED:
          setCameraAccess(CameraStatus.NOT_AUTHORIZED);
          break;

        // Denied implies we can still request for camera permission
        case RESULTS.DENIED:
          const rationale = {
            title: 'Requesting camera access',
            message: 'Etta needs to use your camera to scan QR codes',
            buttonPositive: 'Alright',
            buttonNegative: 'No',
          };
          // asking for permission nicely
          const requestResponse = await request(cameraPermission, rationale);
          setCameraAccess(
            requestResponse === RESULTS.GRANTED
              ? CameraStatus.AUTHORIZED
              : CameraStatus.NOT_AUTHORIZED
          );
          break;
        // Camera permission is limited: some actions are possible
        case RESULTS.LIMITED:
        // Camera permission is granted
        case RESULTS.GRANTED:
          setCameraAccess(CameraStatus.AUTHORIZED);
          break;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScanCode = async (code: string): Promise<void> => {
    if (!code) {
      console.log('No code found in scanned');
    } else {
      setScannedData(code);
      console.log(scannedData);
      try {
        processInputData({
          data: code,
        }).then();
      } catch (e) {
        console.log('Error @onScanCode: ', e.message);
      }
    }
  };
  return (
    <View>
      <CameraKit
        style={styles.camera}
        scanBarcode={true}
        onReadCode={onScanCode}
        torchMode="off"
        cameraType={CameraType.Back}
      />

      <ScanActionsBar />

      <QrCodeFrame />

      <View>
        {cameraAccess === CameraStatus.AUTHORIZED && (
          <Text style={[styles.text, { marginBottom: inset.bottom }]}>
            Center the QR code in the frame
          </Text>
        )}
        {cameraAccess === CameraStatus.NOT_AUTHORIZED && (
          <Text style={[styles.text, { marginBottom: inset.bottom }]}>
            EttaLN doesn't have access to your camera. To remedy this, you can grant EttaLN access
            to the camera in your phone settings
          </Text>
        )}
      </View>
    </View>
  );
};

ScanQRCodeScreen.navigationOptions = {
  ...noHeader,
  ...Platform.select({
    ios: { animation: 'slide_from_bottom' },
  }),
};

const styles = StyleSheet.create({
  actionsContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  cancel: {
    alignContent: 'flex-end',
    paddingRight: 32,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    position: 'absolute',
    left: 9,
    right: 9,
    bottom: 32,
    ...TypographyPresets.Body4,
    color: Colors.common.white,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default ScanQRCodeScreen;
