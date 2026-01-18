import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { lightColors, darkColors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TIP_STORAGE_KEY = '@Bolsio:hasSeenTips';

interface QuickTipProps {
  onDismiss?: () => void;
}

export const QuickTip: React.FC<QuickTipProps> = ({ onDismiss }) => {
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const [currentTip, setCurrentTip] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const tips = [
    {
      icon: '💡',
      title: 'Consejo rápido',
      message: 'Registra tus gastos diariamente para mantener un control preciso',
    },
    {
      icon: '📊',
      title: 'Análisis semanal',
      message: 'Revisa tu resumen cada semana para identificar patrones de gasto',
    },
    {
      icon: '🏷️',
      title: 'Categorías útiles',
      message: 'Crea categorías específicas como "Café diario" o "Transporte público"',
    },
    {
      icon: '🎯',
      title: 'Presupuestos',
      message: 'Configura alertas para no exceder tus límites mensuales',
    },
  ];

  useEffect(() => {
    checkTipStatus();
  }, []);

  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShow]);

  const checkTipStatus = async () => {
    try {
      const hasSeenTips = await AsyncStorage.getItem(TIP_STORAGE_KEY);
      const tutorialCompleted = await AsyncStorage.getItem('@Bolsio:hasCompletedTutorial');

      // Mostrar tips solo si completó el tutorial y no ha visto los tips
      if (tutorialCompleted && !hasSeenTips) {
        // Mostrar con delay para no ser invasivo
        setTimeout(() => setShouldShow(true), 3000);
      }
    } catch (error) {
      console.error('Error checking tip status:', error);
    }
  };

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(prev => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(TIP_STORAGE_KEY, 'true');
    } catch (error) {
      console.error('Error saving tip status:', error);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldShow(false);
      onDismiss?.();
    });
  };

  if (!shouldShow) return null;

  const tip = tips[currentTip];

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: 100,
    },
    container: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 16,
      borderWidth: 1,
      borderColor: colors.outline,
      maxWidth: 400,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    icon: {
      fontSize: 24,
      marginRight: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    message: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      lineHeight: 20,
      marginBottom: 16,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressText: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    nextButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.icon}>{tip.icon}</Text>
          <Text style={styles.title}>{tip.title}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <Text style={styles.message}>{tip.message}</Text>

        <View style={styles.footer}>
          <Text style={styles.progressText}>
            {currentTip + 1} de {tips.length}
          </Text>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>
              {currentTip < tips.length - 1 ? 'Siguiente' : 'Entendido'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};