import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@Bolsio:settings';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CRC', symbol: '₡', name: 'Colón Costarricense' },
];

interface Settings {
  currency: Currency;
  theme: 'light' | 'dark';
}

interface SettingsContextType {
  settings: Settings;
  updateCurrency: (currency: Currency) => Promise<void>;
  updateTheme: (theme: 'light' | 'dark') => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    currency: CURRENCIES[0], // USD por defecto
    theme: 'light',
  });
  const [loading, setLoading] = useState(true);

  // Cargar configuración al iniciar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('[SettingsContext] Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('[SettingsContext] Error guardando configuración:', error);
    }
  };

  const updateCurrency = async (currency: Currency) => {
    await saveSettings({ ...settings, currency });
  };

  const updateTheme = async (theme: 'light' | 'dark') => {
    await saveSettings({ ...settings, theme });
  };

  const value: SettingsContextType = {
    settings,
    updateCurrency,
    updateTheme,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings debe usarse dentro de SettingsProvider');
  }
  return context;
};
