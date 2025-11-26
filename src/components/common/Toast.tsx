import React, { useEffect } from 'react';
import { StyleSheet, Animated, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../context/SettingsContext';
import { lightColors, darkColors } from '../../constants/colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide,
}) => {
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const insets = useSafeAreaInsets();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide después del duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.success,
          backgroundColor: settings.theme === 'dark' ? '#1B5E20' : '#C8E6C9',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: colors.error,
          backgroundColor: settings.theme === 'dark' ? '#B71C1C' : '#FFCDD2',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: colors.warning,
          backgroundColor: settings.theme === 'dark' ? '#E65100' : '#FFE0B2',
        };
      case 'info':
        return {
          icon: 'information-circle' as const,
          color: colors.info,
          backgroundColor: settings.theme === 'dark' ? '#01579B' : '#BBDEFB',
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: insets.top + 8,
      left: 16,
      right: 16,
      zIndex: 9999,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: config.backgroundColor,
      borderRadius: 16,
      padding: 16,
      paddingRight: 20,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderLeftWidth: 4,
      borderLeftColor: config.color,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: config.color,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    message: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: settings.theme === 'dark' ? colors.white : colors.text,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toast}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={24} color={colors.white} />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};
