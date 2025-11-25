import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { TransactionProvider } from './src/context/TransactionContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { colors } from './src/constants/colors';

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
  roundness: 16, // Material Design 3 usa bordes más redondeados
};

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <TransactionProvider>
          <HomeScreen navigation={{ navigate: () => {} }} />
        </TransactionProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
