import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { useCategories } from '../../context/CategoryContext';
import { useAccounts } from '../../context/AccountContext';
import { useSettings } from '../../context/SettingsContext';
import { isFeatureEnabled } from '../../config/featureFlags';
import { lightColors, darkColors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';
import { ITransaction } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: ITransaction | null;
  onDismiss: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onDismiss,
  onEdit,
  onDelete,
}) => {
  const { getAllCategories } = useCategories();
  const { accounts } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;

  if (!transaction) return null;

  const category = getAllCategories(transaction.type).find(c => c.id === transaction.category);
  const account = accounts.find(a => a.id === transaction.accountId);
  const isIncome = transaction.type === 'income';

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.onSurface,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    amountContainer: {
      alignItems: 'center',
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    amountLabel: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    amountValue: {
      fontSize: 48,
      fontWeight: '700',
    },
    typeIndicator: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.surfaceVariant,
    },
    typeText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
    },
    section: {
      marginTop: 20,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    detailIcon: {
      width: 40,
      alignItems: 'center',
      marginRight: 12,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.onSurface,
    },
    categoryIcon: {
      fontSize: 24,
    },
    accountIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountIcon: {
      fontSize: 18,
    },
    descriptionBox: {
      backgroundColor: colors.surfaceVariant,
      padding: 16,
      borderRadius: 12,
      marginTop: 12,
    },
    descriptionText: {
      fontSize: 15,
      color: colors.onSurface,
      lineHeight: 22,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
      gap: 8,
    },
    editButton: {
      backgroundColor: colors.primaryContainer,
    },
    deleteButton: {
      backgroundColor: colors.errorContainer,
    },
    actionButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1} 
          onPress={onDismiss}
        />
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detalle de Transacción</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
              iconColor={colors.onSurfaceVariant}
            />
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {/* Amount Section */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Monto</Text>
              <Text style={[
                styles.amountValue,
                { color: isIncome ? colors.income : colors.expense }
              ]}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount, settings.currency.symbol)}
              </Text>
              <View style={[
                styles.typeIndicator,
                { backgroundColor: isIncome ? colors.income + '20' : colors.expense + '20' }
              ]}>
                <Text style={[
                  styles.typeText,
                  { color: isIncome ? colors.income : colors.expense }
                ]}>
                  {isIncome ? '💰 Ingreso' : '💸 Gasto'}
                </Text>
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.section}>
              {/* Category */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Text style={styles.categoryIcon}>{category?.icon || '💰'}</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Categoría</Text>
                  <Text style={styles.detailValue}>{category?.name || 'Sin categoría'}</Text>
                </View>
              </View>

              {/* Account */}
              {account && (
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <View style={[styles.accountIconContainer, { backgroundColor: account.color }]}>
                      <Text style={styles.accountIcon}>{account.icon}</Text>
                    </View>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Cuenta</Text>
                    <Text style={styles.detailValue}>{account.name}</Text>
                  </View>
                </View>
              )}

              {/* Date */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar-outline" size={24} color={colors.onSurfaceVariant} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Fecha</Text>
                  <Text style={styles.detailValue}>
                    {new Date(transaction.date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="document-text-outline" size={24} color={colors.onSurfaceVariant} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Descripción</Text>
                </View>
              </View>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>{transaction.description}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          {((onEdit && isFeatureEnabled('enableTransactionEdit')) || (onDelete && isFeatureEnabled('enableTransactionDelete'))) && (
            <View style={styles.actionsContainer}>
              {onEdit && isFeatureEnabled('enableTransactionEdit') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={onEdit}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                    Editar
                  </Text>
                </TouchableOpacity>
              )}
              {onDelete && isFeatureEnabled('enableTransactionDelete') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={onDelete}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
