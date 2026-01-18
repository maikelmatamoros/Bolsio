import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useDebts } from '../context/DebtContext';
import { useSettings } from '../context/SettingsContext';
import { lightColors, darkColors } from '../constants/colors';
import { formatCurrency, formatDate } from '../utils/formatters';
import { DebtType, DebtStatus, IDebt } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { Dialog } from '../components/common/Dialog';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { FabMenu, FabMenuItem } from '../components/common/FabMenu';
import { AddDebtScreen } from './AddDebtScreen';

interface DebtsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
}

export const DebtsScreen: React.FC<DebtsScreenProps> = ({ onNavigate }) => {
  const { debts, getTotalOwedToMe, getTotalOwedByMe, markDebtAsPaid, deleteDebt, getDebtBalance, getPaymentsForDebt } = useDebts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();

  const [selectedTab, setSelectedTab] = useState<'owed_to_me' | 'owed_by_me'>('owed_to_me');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<IDebt | null>(null);
  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [addDebtVisible, setAddDebtVisible] = useState(false);
  const [initialDebtType, setInitialDebtType] = useState<DebtType>('owed_to_me');

  const totalOwedToMe = getTotalOwedToMe();
  const totalOwedByMe = getTotalOwedByMe();

  const filteredDebts = debts.filter(debt => debt.type === selectedTab);

  // Función para determinar si una deuda está pendiente (tiene saldo por pagar/cobrar)
  const isDebtPending = (debt: IDebt): boolean => {
    return getDebtBalance(debt.id) > 0;
  };

  const toggleFabMenu = () => {
    setFabMenuVisible(!fabMenuVisible);
  };

  const handleFabMenuItem = (action: 'owed_to_me' | 'owed_by_me') => {
    setInitialDebtType(action);
    setAddDebtVisible(true);
    setFabMenuVisible(false);
  };

  // FAB Menu Items
  const fabMenuItems: FabMenuItem[] = [
    {
      key: 'owed_to_me',
      icon: 'trending-up',
      label: 'Me deben',
      onPress: () => handleFabMenuItem('owed_to_me'),
      backgroundColor: colors.income,
    },
    {
      key: 'owed_by_me',
      icon: 'trending-down',
      label: 'Debo',
      onPress: () => handleFabMenuItem('owed_by_me'),
      backgroundColor: colors.expense,
    },
  ];

  const handleMarkAsPaid = async (debt: IDebt) => {
    try {
      const success = await markDebtAsPaid(debt.id);
      if (success) {
        showToast(
          debt.type === 'owed_to_me'
            ? 'Deuda cobrada correctamente'
            : 'Deuda pagada correctamente',
          'success'
        );
      } else {
        showToast('Error al actualizar la deuda', 'error');
      }
    } catch (error) {
      console.error('Error marking debt as paid:', error);
      showToast('Error al actualizar la deuda', 'error');
    }
  };

  const handleDeleteDebt = async () => {
    if (!debtToDelete) return;

    try {
      const success = await deleteDebt(debtToDelete.id);
      if (success) {
        showToast('Deuda eliminada correctamente', 'success');
      } else {
        showToast('Error al eliminar la deuda', 'error');
      }
    } catch (error) {
      console.error('Error deleting debt:', error);
      showToast('Error al eliminar la deuda', 'error');
    } finally {
      setDeleteDialogVisible(false);
      setDebtToDelete(null);
    }
  };

  const renderDebtItem = ({ item }: { item: IDebt }) => (
    <View style={[styles.debtItem, { backgroundColor: colors.surface }]}>
      <View style={styles.debtHeader}>
        <View style={styles.personContainer}>
          <View style={[styles.personIcon, { backgroundColor: item.type === 'owed_to_me' ? colors.income : colors.expense }]}>
            <Ionicons name="person" size={16} color="white" />
          </View>
          <View>
            <Text style={[styles.personName, { color: colors.onSurface }]}>
              {item.person}
            </Text>
            <Text style={[styles.debtDate, { color: colors.onSurfaceVariant }]}>
              {formatDate(item.date)}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            {
              color: item.type === 'owed_to_me' ? colors.income : colors.expense
            }
          ]}>
            {item.type === 'owed_to_me' ? '+' : '-'}
            {formatCurrency(getDebtBalance(item.id), settings.currency.symbol)}
          </Text>
          {getDebtBalance(item.id) === 0 && (
            <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.statusText}>Completada</Text>
            </View>
          )}
          {getPaymentsForDebt(item.id).length > 0 && getDebtBalance(item.id) > 0 && (
            <View style={[styles.statusBadge, { backgroundColor: colors.info }]}>
              <Text style={styles.statusText}>
                {getPaymentsForDebt(item.id).length} pago{getPaymentsForDebt(item.id).length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {item.description && (
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {item.description}
        </Text>
      )}

      {item.dueDate && (
        <View style={styles.dueDateContainer}>
          <Ionicons name="calendar-outline" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.dueDate, { color: colors.onSurfaceVariant }]}>
            Vence: {formatDate(item.dueDate)}
          </Text>
        </View>
      )}

      {getDebtBalance(item.id) > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onNavigate?.('AddDebtPayment', { debtId: item.id });
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={16} color={colors.onPrimary} />
            <Text style={[styles.actionButtonText, { color: colors.onPrimary }]}>
              Agregar Pago
            </Text>
          </TouchableOpacity>

          {getPaymentsForDebt(item.id).length > 0 && (
            <TouchableOpacity
              style={[styles.historyButton]}
              onPress={() => {
                onNavigate?.('DebtPaymentHistory', { debtId: item.id });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.deleteButton]}
            onPress={() => {
              setDebtToDelete(item);
              setDeleteDialogVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {getDebtBalance(item.id) === 0 && (
        <View style={styles.completedContainer}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.completedText, { color: colors.success }]}>
            {item.type === 'owed_to_me' ? 'Completamente cobrada' : 'Completamente pagada'}
          </Text>
        </View>
      )}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingTop: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.onSurface,
      marginBottom: 16,
    },
    summaryContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    summaryAmount: {
      fontSize: 18,
      fontWeight: '600',
    },
    tabsContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
    },
    tabTextActive: {
      color: colors.onPrimary,
    },
    debtItem: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    debtHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    personContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    personIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    personName: {
      fontSize: 16,
      fontWeight: '600',
    },
    debtDate: {
      fontSize: 12,
      marginTop: 2,
    },
    amountContainer: {
      alignItems: 'flex-end',
    },
    amount: {
      fontSize: 16,
      fontWeight: '600',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginTop: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '500',
      color: 'white',
    },
    description: {
      fontSize: 14,
      marginBottom: 8,
      lineHeight: 20,
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    dueDate: {
      fontSize: 12,
      marginLeft: 4,
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      flex: 1,
      marginRight: 8,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 4,
    },
    historyButton: {
      padding: 8,
      marginRight: 8,
    },
    deleteButton: {
      padding: 8,
    },
    completedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    completedText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 8,
      opacity: 0.7,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.title}>Deudas</Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Me deben</Text>
            <Text style={[styles.summaryAmount, { color: colors.income }]}>
              {formatCurrency(totalOwedToMe, settings.currency.symbol)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Debo</Text>
            <Text style={[styles.summaryAmount, { color: colors.expense }]}>
              {formatCurrency(totalOwedByMe, settings.currency.symbol)}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'owed_to_me' && styles.tabActive]}
            onPress={() => setSelectedTab('owed_to_me')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'owed_to_me' && styles.tabTextActive]}>
              Me deben ({debts.filter(d => d.type === 'owed_to_me' && isDebtPending(d)).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'owed_by_me' && styles.tabActive]}
            onPress={() => setSelectedTab('owed_by_me')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedTab === 'owed_by_me' && styles.tabTextActive]}>
              Debo ({debts.filter(d => d.type === 'owed_by_me' && isDebtPending(d)).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Debt List */}
      {filteredDebts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={selectedTab === 'owed_to_me' ? 'cash-outline' : 'card-outline'}
            size={64}
            color={colors.onSurfaceVariant}
            style={{ opacity: 0.5 }}
          />
          <Text style={styles.emptyText}>
            {selectedTab === 'owed_to_me'
              ? 'No tienes deudas pendientes por cobrar'
              : 'No tienes deudas pendientes por pagar'
            }
          </Text>
          <Text style={styles.emptySubtext}>
            {selectedTab === 'owed_to_me'
              ? 'Las deudas que te deben aparecerán aquí'
              : 'Las deudas que debes aparecerán aquí'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDebts.sort((a, b) => b.date.getTime() - a.date.getTime())}
          keyExtractor={(item) => item.id}
          renderItem={renderDebtItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteDialogVisible}
        title="Eliminar Deuda"
        message={`¿Estás seguro de que deseas eliminar la deuda de ${debtToDelete?.person}?`}
        type="warning"
        buttons={[
          {
            text: 'Cancelar',
            onPress: () => {
              setDeleteDialogVisible(false);
              setDebtToDelete(null);
            },
          },
          {
            text: 'Eliminar',
            onPress: handleDeleteDebt,
            style: 'destructive',
          },
        ]}
        onDismiss={() => {
          setDeleteDialogVisible(false);
          setDebtToDelete(null);
        }}
      />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* FAB Menu */}
      <FabMenu
        menuItems={fabMenuItems}
        visible={fabMenuVisible}
        onToggle={toggleFabMenu}
        fabIcon="add"
      />

      {/* Add Debt Modal */}
      <Modal
        visible={addDebtVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddDebtVisible(false)}
      >
        <AddDebtScreen
          type={initialDebtType}
          onClose={() => setAddDebtVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};