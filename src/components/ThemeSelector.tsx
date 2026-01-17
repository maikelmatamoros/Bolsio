import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { lightColors, darkColors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface ThemeSelectorProps {
  visible: boolean;
  onDismiss: () => void;
}

const THEMES = [
  { 
    id: 'light' as const, 
    name: 'Claro', 
    icon: 'sunny',
    description: 'Interfaz clara y brillante'
  },
  { 
    id: 'dark' as const, 
    name: 'Oscuro', 
    icon: 'moon',
    description: 'Interfaz oscura para poca luz'
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onDismiss }) => {
  const { settings, updateTheme } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  const handleSelectTheme = async (theme: 'light' | 'dark') => {
    await updateTheme(theme);
    onDismiss();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: colors.surface,
      width: '90%',
      borderRadius: 20,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    list: {
      padding: 20,
    },
    themeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      marginBottom: 12,
    },
    themeItemActive: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primary,
    },
    themeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    themeIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      marginRight: 16,
    },
    themeIconActive: {
      backgroundColor: colors.primaryContainer,
    },
    themeText: {
      flex: 1,
    },
    themeName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    themeDescription: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
    },
    footer: {
      padding: 16,
      backgroundColor: colors.surfaceVariant,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
    },
    footerNote: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      fontStyle: 'italic',
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
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onDismiss}
      >
        <TouchableOpacity 
          style={styles.modal} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Tema</Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.list}>
            {THEMES.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeItem,
                  settings.theme === theme.id && styles.themeItemActive,
                ]}
                onPress={() => handleSelectTheme(theme.id)}
                activeOpacity={0.7}
              >
                <View style={styles.themeInfo}>
                  <View style={[
                    styles.themeIcon,
                    settings.theme === theme.id && styles.themeIconActive
                  ]}>
                    <Ionicons 
                      name={theme.icon as any} 
                      size={28} 
                      color={settings.theme === theme.id ? colors.primary : colors.textMuted} 
                    />
                  </View>
                  <View style={styles.themeText}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    <Text style={styles.themeDescription}>{theme.description}</Text>
                  </View>
                </View>
                
                {settings.theme === theme.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
