import React, { useState, useEffect } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { TransactionProvider } from './src/context/TransactionContext';
import { AccountProvider } from './src/context/AccountContext';
import { CategoryProvider } from './src/context/CategoryContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { lightColors, darkColors } from './src/constants/colors';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { View, TouchableOpacity, Text, StyleSheet, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Configurar temas Material Design 3
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    onPrimary: lightColors.onPrimary,
    primaryContainer: lightColors.primaryContainer,
    onPrimaryContainer: lightColors.onPrimaryContainer,
    secondary: lightColors.secondary,
    onSecondary: lightColors.onSecondary,
    secondaryContainer: lightColors.secondaryContainer,
    onSecondaryContainer: lightColors.onSecondaryContainer,
    tertiary: lightColors.info,
    error: lightColors.error,
    onError: lightColors.onError,
    errorContainer: lightColors.errorContainer,
    onErrorContainer: lightColors.onErrorContainer,
    background: lightColors.background,
    onBackground: lightColors.onBackground,
    surface: lightColors.surface,
    onSurface: lightColors.onSurface,
    surfaceVariant: lightColors.surfaceVariant,
    onSurfaceVariant: lightColors.onSurfaceVariant,
    outline: lightColors.outline,
    outlineVariant: lightColors.outlineVariant,
  },
  roundness: 16,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    onPrimary: darkColors.onPrimary,
    primaryContainer: darkColors.primaryContainer,
    onPrimaryContainer: darkColors.onPrimaryContainer,
    secondary: darkColors.secondary,
    onSecondary: darkColors.onSecondary,
    secondaryContainer: darkColors.secondaryContainer,
    onSecondaryContainer: darkColors.onSecondaryContainer,
    tertiary: darkColors.info,
    error: darkColors.error,
    onError: darkColors.onError,
    errorContainer: darkColors.errorContainer,
    onErrorContainer: darkColors.onErrorContainer,
    background: darkColors.background,
    onBackground: darkColors.onBackground,
    surface: darkColors.surface,
    onSurface: darkColors.onSurface,
    surfaceVariant: darkColors.surfaceVariant,
    onSurfaceVariant: darkColors.onSurfaceVariant,
    outline: darkColors.outline,
    outlineVariant: darkColors.outlineVariant,
  },
  roundness: 16,
};

// Componente interno que usa los insets
function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Transactions' | 'Settings'>('Home');
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  // Manejar botón de back en Android
  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'Settings') {
        // Si estamos en Settings, volver a Home
        setCurrentScreen('Home');
        return true; // Prevenir comportamiento por defecto
      }
      // Si estamos en Home, permitir salir de la app
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentScreen]);

  // Estilos dinámicos
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    tabBar: {
      flexDirection: 'row' as const,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
      paddingTop: 6,
      paddingBottom: Math.max(insets.bottom, 8),
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    tabButton: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingVertical: 6,
    },
    tabIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600' as const,
      marginTop: 2,
    },
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Contenido de la pantalla */}
      <View style={dynamicStyles.content}>
        {currentScreen === 'Home' && (
          <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />
        )}
        {currentScreen === 'Transactions' && <TransactionsScreen />}
        {currentScreen === 'Settings' && <SettingsScreen />}
      </View>
      
      {/* Bottom Tab Bar personalizada */}
      <View style={dynamicStyles.tabBar}>
        <TouchableOpacity
          style={dynamicStyles.tabButton}
          onPress={() => setCurrentScreen('Home')}
          activeOpacity={0.7}
        >
          <View style={[
            dynamicStyles.tabIconContainer,
            currentScreen === 'Home' && { backgroundColor: colors.primaryContainer }
          ]}>
            <Ionicons
              name={currentScreen === 'Home' ? 'home' : 'home-outline'}
              size={22}
              color={currentScreen === 'Home' ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={[
            dynamicStyles.tabLabel,
            { color: currentScreen === 'Home' ? colors.primary : colors.textMuted }
          ]}>
            Inicio
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={dynamicStyles.tabButton}
          onPress={() => setCurrentScreen('Transactions')}
          activeOpacity={0.7}
        >
          <View style={[
            dynamicStyles.tabIconContainer,
            currentScreen === 'Transactions' && { backgroundColor: colors.primaryContainer }
          ]}>
            <Ionicons
              name={currentScreen === 'Transactions' ? 'list' : 'list-outline'}
              size={22}
              color={currentScreen === 'Transactions' ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={[
            dynamicStyles.tabLabel,
            { color: currentScreen === 'Transactions' ? colors.primary : colors.textMuted }
          ]}>
            Transacciones
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={dynamicStyles.tabButton}
          onPress={() => setCurrentScreen('Settings')}
          activeOpacity={0.7}
        >
          <View style={[
            dynamicStyles.tabIconContainer,
            currentScreen === 'Settings' && { backgroundColor: colors.primaryContainer }
          ]}>
            <Ionicons
              name={currentScreen === 'Settings' ? 'settings' : 'settings-outline'}
              size={22}
              color={currentScreen === 'Settings' ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={[
            dynamicStyles.tabLabel,
            { color: currentScreen === 'Settings' ? colors.primary : colors.textMuted }
          ]}>
            Ajustes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemedApp />
        </SettingsProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

// Componente que tiene acceso al contexto de Settings
function ThemedApp() {
  const { settings } = useSettings();
  const theme = settings.theme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AccountProvider>
        <CategoryProvider>
          <TransactionProvider>
            <AppContent />
          </TransactionProvider>
        </CategoryProvider>
      </AccountProvider>
    </PaperProvider>
  );
}
