import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const isTransfer = transaction.type === 'transfer';
  const category = isTransfer 
    ? { id: 'transfer', name: 'Transferencia', icon: '↔️' }
    : getAllCategories(transaction.type).find(c => c.id === transaction.category);
  const account = accounts.find(a => a.id === transaction.accountId);
  const destinationAccount = isTransfer && transaction.destinationAccountId
    ? accounts.find(a => a.id === transaction.destinationAccountId)
    : null;
  const isIncome = transaction.type === 'income';

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '75%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
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
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    amountContainer: {
      alignItems: 'center',
      paddingVertical: 20,
      paddingBottom: 16,
    },
    amountValue: {
      fontSize: 36,
      fontWeight: '700',
      marginBottom: 8,
    },
    typeIndicator: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
    },
    typeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    section: {
      marginTop: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 4,
    },
    detailIcon: {
      width: 32,
      alignItems: 'center',
      marginRight: 12,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 11,
      color: colors.onSurfaceVariant,
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.onSurface,
    },
    categoryIcon: {
      fontSize: 20,
    },
    accountIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountIcon: {
      fontSize: 16,
    },
    descriptionBox: {
      backgroundColor: colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    descriptionText: {
      fontSize: 14,
      color: colors.onSurface,
      lineHeight: 20,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      gap: 6,
    },
    editButton: {
      backgroundColor: colors.primaryContainer,
    },
    deleteButton: {
      backgroundColor: colors.errorContainer,
    },
    actionButtonText: {
      fontSize: 14,
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
        <SafeAreaView style={styles.modal} edges={['bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Detalle</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Amount Section */}
            <View style={styles.amountContainer}>
              <Text style={[
                styles.amountValue,
                { color: isTransfer ? colors.primary : (isIncome ? colors.income : colors.expense) }
              ]}>
                {isTransfer ? '' : (isIncome ? '+' : '-')} {formatCurrency(transaction.amount, settings.currency.symbol)}
              </Text>
              <View style={[
                styles.typeIndicator,
                { backgroundColor: isTransfer ? colors.primary + '20' : (isIncome ? colors.income + '20' : colors.expense + '20') }
              ]}>
                <Text style={[
                  styles.typeText,
                  { color: isTransfer ? colors.primary : (isIncome ? colors.income : colors.expense) }
                ]}>
                  {isTransfer ? '↔️ Transferencia' : (isIncome ? '💰 Ingreso' : '💸 Gasto')}
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
                    <Text style={styles.detailLabel}>{isTransfer ? 'Cuenta Origen' : 'Cuenta'}</Text>
                    <Text style={styles.detailValue}>{account.name}</Text>
                  </View>
                </View>
              )}

              {/* Destination Account (only for transfers) */}
              {isTransfer && destinationAccount && (
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <View style={[styles.accountIconContainer, { backgroundColor: destinationAccount.color }]}>
                      <Text style={styles.accountIcon}>{destinationAccount.icon}</Text>
                    </View>
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Cuenta Destino</Text>
                    <Text style={styles.detailValue}>{destinationAccount.name}</Text>
                  </View>
                </View>
              )}

              {/* Date */}
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar-outline" size={20} color={colors.onSurfaceVariant} />
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
              {transaction.description && (
                <>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="document-text-outline" size={20} color={colors.onSurfaceVariant} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Descripción</Text>
                    </View>
                  </View>
                  <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{transaction.description}</Text>
                  </View>
                </>
              )}
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
                  <Ionicons name="pencil" size={18} color={colors.primary} />
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
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={[styles.actionButtonText, { color: colors.error }]}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};
