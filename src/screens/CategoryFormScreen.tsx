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
import { useCategories } from '../context/CategoryContext';
import { useSettings } from '../context/SettingsContext';
import { Toast } from '../components/common/Toast';
import { Dialog } from '../components/common/Dialog';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';
import { lightColors, darkColors } from '../constants/colors';
import { TransactionType } from '../types';
import { Ionicons } from '@expo/vector-icons';

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
  const existingCategory = categoryId && type !== 'transfer'
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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
    },
    closeButton: {
      padding: 4,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 100, // Espacio para los botones fijos
    },
    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 8,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    previewIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    previewName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.onSurface,
      flex: 1,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurface,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.onSurface,
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
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.outline,
      backgroundColor: colors.surface,
    },
    iconTabActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    iconTabText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
    },
    iconTabTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.outline,
      backgroundColor: colors.surface,
    },
    iconButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    iconText: {
      fontSize: 20,
    },
    actionsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
      gap: 8,
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onPrimary || '#FFFFFF',
    },
    deleteButton: {
      backgroundColor: colors.errorContainer,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
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
            <Text style={styles.sectionTitle}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Restaurantes"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          </View>

          {/* Ícono */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ícono</Text>

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
                    activeOpacity={0.7}
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
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconText}>{categoryIcon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción fijos */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Actualizar Categoría' : 'Crear Categoría'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Eliminar Categoría</Text>
          </TouchableOpacity>
        )}
      </View>

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
