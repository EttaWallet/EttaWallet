import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

const alert = string => {
  const { t } = useTranslation();

  Alert.alert(t('alerts.default'), string);
};
export default alert;
