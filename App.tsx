import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { TransactionProvider } from './src/context/TransactionContext';
import { AccountProvider } from './src/context/AccountContext';
import { CategoryProvider } from './src/context/CategoryContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { DebtProvider } from './src/context/DebtContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DebtsScreen } from './src/screens/DebtsScreen';
import { InteractiveTutorial, TutorialStep } from './src/components/onboarding/InteractiveTutorial';
import { useTutorial } from './src/hooks/useTutorial';
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
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'Transactions' | 'Debts' | 'Settings'>('Home');
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { shouldShowTutorial, completeTutorial, skipTutorial, recheckTutorial } = useTutorial();

  // Refs para el tutorial
  const quickActionsRef = useRef<any>(null);
  const transactionsTabRef = useRef<any>(null);
  const settingsTabRef = useRef<any>(null);

  // Re-chequear tutorial cuando volvemos a Home
  useEffect(() => {
    if (currentScreen === 'Home') {
      recheckTutorial();
    }
  }, [currentScreen]);

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
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12),
    },
    tabButton: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingVertical: 8,
    },
    tabIcon: {
      marginBottom: 4,
    },
    tabLabel: {
      fontSize: 12,
      fontWeight: '600' as const,
    },
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Contenido de la pantalla */}
      <View style={dynamicStyles.content}>
        {currentScreen === 'Home' && (
          <HomeScreen
            onNavigate={(screen) => setCurrentScreen(screen as 'Home' | 'Transactions' | 'Debts' | 'Settings')}
            quickActionsRef={quickActionsRef}
          />
        )}
        {currentScreen === 'Transactions' && <TransactionsScreen />}
        {currentScreen === 'Debts' && <DebtsScreen />}
        {currentScreen === 'Settings' && <SettingsScreen />}
      </View>
      
      {/* Bottom Tab Bar personalizada */}
      <View style={dynamicStyles.tabBar}>
        <TouchableOpacity
          style={dynamicStyles.tabButton}
          onPress={() => setCurrentScreen('Home')}
          activeOpacity={0.7}
        >
          <View style={dynamicStyles.tabIcon}>
            <Ionicons
              name={currentScreen === 'Home' ? 'home' : 'home-outline'}
              size={24}
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
          ref={transactionsTabRef}
          style={dynamicStyles.tabButton}
          onPress={() => setCurrentScreen('Transactions')}
          activeOpacity={0.7}
        >
          <View style={dynamicStyles.tabIcon}>
            <Ionicons
              name={currentScreen === 'Transactions' ? 'list' : 'list-outline'}
              size={24}
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
          onPress={() => setCurrentScreen('Debts')}
          activeOpacity={0.7}
        >
          <View style={dynamicStyles.tabIcon}>
            <Ionicons
              name={currentScreen === 'Debts' ? 'swap-horizontal' : 'swap-horizontal-outline'}
              size={24}
              color={currentScreen === 'Debts' ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={[
            dynamicStyles.tabLabel,
            { color: currentScreen === 'Debts' ? colors.primary : colors.textMuted }
          ]}>
            Deudas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          ref={settingsTabRef}
          style={dynamicStyles.tabButton}
          onPress={() => setCurrentScreen('Settings')}
          activeOpacity={0.7}
        >
          <View style={dynamicStyles.tabIcon}>
            <Ionicons
              name={currentScreen === 'Settings' ? 'settings' : 'settings-outline'}
              size={24}
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

      {/* Tutorial interactivo */}
      <InteractiveTutorial
        visible={shouldShowTutorial}
        steps={[
          {
            id: 'welcome',
            title: '¡Bienvenido a Bolsio! 👋',
            description: 'Vamos a hacer un tour rápido por las funciones más importantes. ¡Solo tomará 30 segundos!',
            spotlightType: 'none',
          },
          {
            id: 'quick-actions',
            title: 'Registra tus Transacciones 💰',
            description: 'Aquí puedes agregar ingresos y gastos con un solo toque. Esta es la función principal de Bolsio.',
            targetRef: quickActionsRef,
            spotlightType: 'rect',
          },
          {
            id: 'transactions-tab',
            title: 'Pestaña de Transacciones 📋',
            description: 'Aquí puedes ver todo tu historial completo de ingresos y gastos. ¡Vamos a verla!',
            targetRef: transactionsTabRef,
            spotlightType: 'rect',
            action: () => setCurrentScreen('Transactions'),
          },
          {
            id: 'transactions-screen',
            title: 'Historial Completo 📊',
            description: 'Aquí verás todas tus transacciones ordenadas por fecha. Puedes tocar cualquiera para ver detalles, editar o eliminar.',
            spotlightType: 'none',
          },
          {
            id: 'settings-tab',
            title: 'Pestaña de Ajustes ⚙️',
            description: 'Aquí puedes personalizar categorías, cuentas, moneda y más. ¡Vamos a verla!',
            targetRef: settingsTabRef,
            spotlightType: 'rect',
            action: () => setCurrentScreen('Settings'),
          },
          {
            id: 'settings-screen',
            title: 'Personalización 🎨',
            description: 'Aquí puedes configurar tus categorías, cuentas, cambiar el tema oscuro/claro, y más opciones.',
            spotlightType: 'none',
          },
          {
            id: 'finish',
            title: '¡Todo listo! 🎉',
            description: '¡Perfecto! Ya conoces Bolsio. ¡Comienza a registrar tus transacciones y toma control de tus finanzas!',
            spotlightType: 'none',
            action: () => setCurrentScreen('Home'),
          },
        ]}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
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
            <DebtProvider>
              <AppContent />
            </DebtProvider>
          </TransactionProvider>
        </CategoryProvider>
      </AccountProvider>
    </PaperProvider>
  );
}
