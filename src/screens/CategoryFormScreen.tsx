import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { IconButton } from 'react-native-paper';
import { useCategories } from '../context/CategoryContext';
import { useSettings } from '../context/SettingsContext';
import { Toast } from '../components/common/Toast';
import { Dialog } from '../components/common/Dialog';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';
import { lightColors, darkColors } from '../constants/colors';
import { TransactionType } from '../types';

interface CategoryFormScreenProps {
  categoryId?: string;
  type: TransactionType;
  onClose: () => void;
}

const CATEGORY_ICONS = {
  comida: ['🍔', '🍕', '🍜', '🍱', '🍰', '☕', '🥗', '🌮', '🍿', '🥤'],
  transporte: ['🚗', '🚕', '🚌', '🚇', '✈️', '🚲', '⛽', '🚦', '🛴', '🚁'],
  entretenimiento: ['🎬', '🎮', '🎵', '🎨', '📺', '🎪', '🎭', '🎯', '🎲', '🎹'],
  compras: ['🛍️', '👕', '👞', '💄', '🎁', '📱', '💻', '⌚', '👜', '🕶️'],
  servicios: ['📄', '💡', '💧', '📞', '📡', '🔌', '🗑️', '🏠', '🔧', '🔑'],
  salud: ['🏥', '💊', '🩺', '🧬', '⚕️', '🏨', '🔬', '💉', '🦷', '👓'],
  educacion: ['📚', '✏️', '📖', '🎓', '🖊️', '📝', '🏫', '🎒', '📐', '🖍️'],
  dinero: ['💼', '💰', '💵', '💳', '💎', '📈', '📊', '🏦', '💸', '🪙'],
  otros: ['⭐', '❤️', '🎉', '🔥', '✨', '🌟', '💫', '🎈', '🏆', '🎯'],
};

export const CategoryFormScreen: React.FC<CategoryFormScreenProps> = ({
  categoryId,
  type,
  onClose,
}) => {
  const { customCategories, addCustomCategory, updateCustomCategory, deleteCustomCategory } = useCategories();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();
  const { dialog, hideDialog, confirm } = useDialog();

  // Obtener categoría si estamos editando
  const existingCategory = categoryId
    ? customCategories[type].find(c => c.id === categoryId)
    : null;

  const [name, setName] = useState(existingCategory?.name || '');
  const [icon, setIcon] = useState(existingCategory?.icon || '💰');
  const [selectedIconTab, setSelectedIconTab] = useState<keyof typeof CATEGORY_ICONS>('dinero');

  const isEditing = !!categoryId;

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('El nombre de la categoría es obligatorio', 'error');
      return;
    }

    let success = false;
    if (isEditing) {
      success = await updateCustomCategory(categoryId!, { name: name.trim(), icon }, type);
    } else {
      success = await addCustomCategory({ name: name.trim(), icon }, type);
    }

    if (success) {
      showToast(
        isEditing ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente',
        'success'
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      showToast('No se pudo guardar la categoría', 'error');
    }
  };

  const handleDelete = () => {
    confirm(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta categoría?',
      async () => {
        const success = await deleteCustomCategory(categoryId!, type);
        if (success) {
          showToast('Categoría eliminada correctamente', 'success');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          showToast('No se pudo eliminar la categoría', 'error');
        }
      },
      'error'
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    previewCard: {
      padding: 24,
      backgroundColor: colors.primaryContainer,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 24,
    },
    previewIcon: {
      fontSize: 64,
      marginBottom: 12,
    },
    previewName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.onPrimaryContainer,
    },
    section: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    iconContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    iconTabsContainer: {
      marginBottom: 12,
    },
    iconTabsScroll: {
      flexGrow: 0,
    },
    iconTabs: {
      flexDirection: 'row',
      gap: 6,
      paddingRight: 16,
    },
    iconTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surface,
    },
    iconTabActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    iconTabText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    iconTabTextActive: {
      color: colors.primary,
    },
    iconButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surface,
    },
    iconButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    iconText: {
      fontSize: 28,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.white,
    },
    deleteButton: {
      backgroundColor: colors.error,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.white,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
        </Text>
        <IconButton icon="close" size={24} onPress={onClose} iconColor={colors.textMuted} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Vista Previa */}
          <View style={styles.previewCard}>
            <Text style={styles.previewIcon}>{icon}</Text>
            <Text style={styles.previewName}>{name || 'Nombre de categoría'}</Text>
          </View>

          {/* Nombre */}
          <View style={styles.section}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Restaurantes"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Ícono */}
          <View style={styles.section}>
            <Text style={styles.label}>Ícono</Text>
            
            {/* Tabs de categorías de íconos */}
            <View style={styles.iconTabsContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.iconTabsScroll}
                contentContainerStyle={styles.iconTabs}
              >
                {Object.keys(CATEGORY_ICONS).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.iconTab,
                      selectedIconTab === tab && styles.iconTabActive,
                    ]}
                    onPress={() => setSelectedIconTab(tab as keyof typeof CATEGORY_ICONS)}
                  >
                    <Text style={[
                      styles.iconTabText,
                      selectedIconTab === tab && styles.iconTabTextActive,
                    ]}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Grid de íconos */}
            <View style={styles.iconContainer}>
              {CATEGORY_ICONS[selectedIconTab].map((categoryIcon) => (
                <TouchableOpacity
                  key={categoryIcon}
                  style={[
                    styles.iconButton,
                    icon === categoryIcon && styles.iconButtonActive,
                  ]}
                  onPress={() => setIcon(categoryIcon)}
                >
                  <Text style={styles.iconText}>{categoryIcon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Actualizar Categoría' : 'Crear Categoría'}
            </Text>
          </TouchableOpacity>

          {/* Botón Eliminar */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Eliminar Categoría</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
      <Dialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        buttons={dialog.buttons}
        onDismiss={hideDialog}
      />
    </SafeAreaView>
  );
};
