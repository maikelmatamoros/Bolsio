import React, { useState, useEffect } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { TransactionProvider } from './src/context/TransactionContext';
import { AccountProvider } from './src/context/AccountContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/constants/colors';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { View, TouchableOpacity, Text, StyleSheet, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Configurar tema Material Design 3
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primaryContainer,
    onPrimaryContainer: colors.onPrimaryContainer,
    secondary: colors.secondary,
    onSecondary: colors.onSecondary,
    secondaryContainer: colors.secondaryContainer,
    onSecondaryContainer: colors.onSecondaryContainer,
    tertiary: colors.info,
    error: colors.error,
    onError: colors.onError,
    errorContainer: colors.errorContainer,
    onErrorContainer: colors.onErrorContainer,
    background: colors.background,
    onBackground: colors.onBackground,
    surface: colors.surface,
    onSurface: colors.onSurface,
    surfaceVariant: colors.surfaceVariant,
    onSurfaceVariant: colors.onSurfaceVariant,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
  },
  roundness: 16,
};

// Componente interno que usa los insets
function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Settings'>('Home');
  const insets = useSafeAreaInsets();

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

  return (
    <View style={styles.container}>
      {/* Contenido de la pantalla */}
      <View style={styles.content}>
        {currentScreen === 'Home' ? <HomeScreen /> : <SettingsScreen />}
      </View>
      
      {/* Bottom Tab Bar personalizada */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentScreen('Home')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.tabIconContainer,
            currentScreen === 'Home' && styles.tabIconContainerActive
          ]}>
            <Ionicons
              name={currentScreen === 'Home' ? 'home' : 'home-outline'}
              size={22}
              color={currentScreen === 'Home' ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={[
            styles.tabLabel,
            currentScreen === 'Home' && styles.tabLabelActive
          ]}>
            Inicio
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setCurrentScreen('Settings')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.tabIconContainer,
            currentScreen === 'Settings' && styles.tabIconContainerActive
          ]}>
            <Ionicons
              name={currentScreen === 'Settings' ? 'settings' : 'settings-outline'}
              size={22}
              color={currentScreen === 'Settings' ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={[
            styles.tabLabel,
            currentScreen === 'Settings' && styles.tabLabelActive
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
        <PaperProvider theme={theme}>
          <AccountProvider>
            <TransactionProvider>
              <AppContent />
            </TransactionProvider>
          </AccountProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    paddingTop: 6,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabIconContainerActive: {
    backgroundColor: colors.primaryContainer,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});