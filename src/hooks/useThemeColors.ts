import { useSettings } from '../context/SettingsContext';
import { lightColors, darkColors, Colors } from '../constants/colors';

export const useThemeColors = (): Colors => {
  const { settings } = useSettings();
  return settings.theme === 'dark' ? darkColors : lightColors;
};
