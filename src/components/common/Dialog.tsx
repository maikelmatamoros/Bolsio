import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { lightColors, darkColors } from '../../constants/colors';

export type DialogType = 'info' | 'warning' | 'error' | 'success';

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'destructive' | 'cancel';
}

interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  type?: DialogType;
  buttons: DialogButton[];
  onDismiss?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons,
  onDismiss,
}) => {
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: colors.success };
      case 'error':
        return { name: 'close-circle' as const, color: colors.error };
      case 'warning':
        return { name: 'warning' as const, color: colors.warning };
      case 'info':
      default:
        return { name: 'information-circle' as const, color: colors.info };
    }
  };

  const iconConfig = getIconConfig();

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'destructive':
        return { color: colors.error, fontWeight: '700' as const };
      case 'cancel':
        return { color: colors.textMuted, fontWeight: '500' as const };
      default:
        return { color: colors.primary, fontWeight: '700' as const };
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    dialog: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: settings.theme === 'dark' 
        ? `${iconConfig.color}33` 
        : `${iconConfig.color}22`,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 15,
      color: colors.textLight,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onDismiss}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.dialog}>
            <View style={styles.iconContainer}>
              <Ionicons name={iconConfig.name} size={36} color={iconConfig.color} />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => {
                const buttonTextStyle = getButtonStyle(button.style);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.button}
                    onPress={button.onPress}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.buttonText, buttonTextStyle]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
