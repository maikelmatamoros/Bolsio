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
import { useAccounts } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';
import { Card } from '../components/common/Card';
import { Toast } from '../components/common/Toast';
import { Dialog } from '../components/common/Dialog';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { lightColors, darkColors } from '../constants/colors';
import { AccountType, IAccount } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AccountFormScreenProps {
  accountId?: string;
  onClose: () => void;
}

const ACCOUNT_TYPES: { id: AccountType; name: string; description: string }[] = [
  { id: 'cash', name: 'Efectivo', description: 'Dinero en efectivo' },
  { id: 'bank', name: 'Banco', description: 'Cuenta bancaria' },
  { id: 'card', name: 'Tarjeta', description: 'Tarjeta de crédito/débito' },
  { id: 'digital', name: 'Digital', description: 'Billetera digital' },
];

const ACCOUNT_ICONS = ['💵', '🏦', '💳', '📱', '💰', '🪙', '💎', '🎯'];
const ACCOUNT_COLORS = [
  '#4CAF50', '#2196F3', '#9C27B0', '#F44336',
  '#FF9800', '#00BCD4', '#E91E63', '#673AB7',
];

export const AccountFormScreen: React.FC<AccountFormScreenProps> = ({ accountId, onClose }) => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();
  const { dialog, hideDialog, confirm } = useDialog();
  
  // Obtener cuenta si estamos editando
  const existingAccount = accountId ? accounts.find(a => a.id === accountId) : null;
  
  const [name, setName] = useState(existingAccount?.name || '');
  const [type, setType] = useState<AccountType>(existingAccount?.type || 'cash');
  const balanceInput = useCurrencyInput(existingAccount?.balance || 0);
  const [icon, setIcon] = useState(existingAccount?.icon || '💵');
  const [color, setColor] = useState(existingAccount?.color || '#4CAF50');

  const isEditing = !!accountId;

  const handleSave = async () => {
    // Validaciones
    if (!name.trim()) {
      showToast('El nombre de la cuenta es obligatorio', 'error');
      return;
    }

    const accountData: Partial<IAccount> = {
      name: name.trim(),
      type,
      balance: balanceInput.numericValue,
      icon,
      color,
      isActive: true,
    };

    let success = false;
    if (isEditing) {
      success = await updateAccount(accountId!, accountData);
    } else {
      success = await addAccount(accountData);
    }

    if (success) {
      showToast(
        isEditing ? 'Cuenta actualizada correctamente' : 'Cuenta creada correctamente',
        'success'
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      showToast('No se pudo guardar la cuenta', 'error');
    }
  };

  const handleDelete = () => {
    confirm(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.',
      async () => {
        const success = await deleteAccount(accountId!);
        if (success) {
          showToast('Cuenta eliminada correctamente', 'success');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          showToast('No se pudo eliminar la cuenta', 'error');
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
    scrollView: {
      flex: 1,
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
    content: {
      padding: 16,
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
    typeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeButton: {
      flex: 1,
      minWidth: '47%',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surface,
    },
    typeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    typeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    typeDescription: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    iconContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    iconButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.outlineVariant,
    },
    iconButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    iconText: {
      fontSize: 28,
    },
    colorContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    colorButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 3,
      borderColor: colors.surface,
      elevation: 2,
    },
    colorButtonActive: {
      borderColor: colors.text,
      borderWidth: 4,
    },
    previewCard: {
      padding: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    previewIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    previewIconText: {
      fontSize: 28,
    },
    previewInfo: {
      flex: 1,
    },
    previewName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    previewBalance: {
      fontSize: 14,
      color: colors.textLight,
      marginTop: 4,
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'}
        </Text>
        <IconButton
          icon="close"
          size={24}
          onPress={onClose}
          iconColor={colors.textMuted}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Vista Previa */}
          <View style={[styles.previewCard, { backgroundColor: color }]}>
            <View style={styles.previewIcon}>
              <Text style={styles.previewIconText}>{icon}</Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={[styles.previewName, { color: colors.white }]}>
                {name || 'Nombre de la cuenta'}
              </Text>
              <Text style={[styles.previewBalance, { color: colors.white, opacity: 0.9 }]}>
                {formatCurrency(balanceInput.numericValue, settings.currency.symbol)}
              </Text>
            </View>
          </View>

          {/* Nombre */}
          <View style={styles.section}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Mi cuenta de banco"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Balance Inicial */}
          <View style={styles.section}>
            <Text style={styles.label}>Balance Inicial</Text>
            <TextInput
              style={styles.input}
              value={balanceInput.displayValue}
              onChangeText={balanceInput.handleChange}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Tipo de Cuenta */}
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de Cuenta</Text>
            <View style={styles.typeContainer}>
              {ACCOUNT_TYPES.map((accountType) => (
                <TouchableOpacity
                  key={accountType.id}
                  style={[
                    styles.typeButton,
                    type === accountType.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setType(accountType.id)}
                >
                  <Text style={styles.typeName}>{accountType.name}</Text>
                  <Text style={styles.typeDescription}>{accountType.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ícono */}
          <View style={styles.section}>
            <Text style={styles.label}>Ícono</Text>
            <View style={styles.iconContainer}>
              {ACCOUNT_ICONS.map((accountIcon) => (
                <TouchableOpacity
                  key={accountIcon}
                  style={[
                    styles.iconButton,
                    icon === accountIcon && styles.iconButtonActive,
                  ]}
                  onPress={() => setIcon(accountIcon)}
                >
                  <Text style={styles.iconText}>{accountIcon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View style={styles.section}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorContainer}>
              {ACCOUNT_COLORS.map((accountColor) => (
                <TouchableOpacity
                  key={accountColor}
                  style={[
                    styles.colorButton,
                    { backgroundColor: accountColor },
                    color === accountColor && styles.colorButtonActive,
                  ]}
                  onPress={() => setColor(accountColor)}
                />
              ))}
            </View>
          </View>

          {/* Botón Guardar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Actualizar Cuenta' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Botón Eliminar (solo si estamos editando) */}
          {isEditing && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Toast de notificaciones */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Dialog de confirmación */}
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
