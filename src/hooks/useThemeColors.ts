import { useSettings } from '../context/SettingsContext';
import { lightColors, darkColors } from '../constants/colors';

export const useThemeColors = () => {
  const { settings } = useSettings();
  return settings.theme === 'dark' ? darkColors : lightColors;
};
