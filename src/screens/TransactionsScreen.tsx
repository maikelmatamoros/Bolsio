import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';
import { isFeatureEnabled } from '../config/featureFlags';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { AddTransactionScreen } from './AddTransactionScreen';
import { Dialog } from '../components/common/Dialog';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { groupTransactionsByDate } from '../utils/formatters';
import { TransactionType, ITransaction } from '../types';
import { Ionicons } from '@expo/vector-icons';

export const TransactionsScreen: React.FC = () => {
  const { transactions, loading, deleteTransaction } = useTransactions();
  const { updateAccountBalance } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();

  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [addTransactionVisible, setAddTransactionVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<ITransaction | null>(null);

  // Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query)
      );
    }

    // Ordenar por fecha descendente
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, searchQuery]);

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const handleTransactionPress = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const handleEditTransaction = () => {
    if (selectedTransaction && isFeatureEnabled('enableTransactionEdit')) {
      setEditingTransaction(selectedTransaction);
      setDetailModalVisible(false);
      setAddTransactionVisible(true);
    }
  };

  const handleDeleteTransaction = () => {
    if (selectedTransaction && isFeatureEnabled('enableTransactionDelete')) {
      setTransactionToDelete(selectedTransaction);
      setDetailModalVisible(false);
      setDeleteDialogVisible(true);
    }
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      // Revertir balance de la cuenta
      const operation = transactionToDelete.type === 'income' ? 'subtract' : 'add';
      await updateAccountBalance(transactionToDelete.accountId, transactionToDelete.amount, operation);

      // Eliminar transacción
      const success = await deleteTransaction(transactionToDelete.id);

      if (success) {
        showToast('Transacción eliminada correctamente', 'success');
      } else {
        showToast('Error al eliminar la transacción', 'error');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showToast('Error al eliminar la transacción', 'error');
    } finally {
      setDeleteDialogVisible(false);
      setTransactionToDelete(null);
    }
  };

  const handleCloseAddTransaction = () => {
    setAddTransactionVisible(false);
    setEditingTransaction(null);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.onSurface,
      marginBottom: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.onSurface,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.outline,
      backgroundColor: colors.surface,
    },
    filterChipActive: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
    },
    filterChipTextActive: {
      color: colors.primary,
    },
    content: {
      flex: 1,
    },
    dateHeader: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.onSurfaceVariant,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 24,
    },
    statsContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    statCard: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceVariant,
    },
    statLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
    },
  });

  // Calcular estadísticas del filtro actual
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, count: filteredTransactions.length };
  }, [filteredTransactions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transacciones</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={colors.onSurfaceVariant} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por descripción..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[
              styles.filterChipText,
              filterType === 'all' && styles.filterChipTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterType === 'income' && styles.filterChipActive]}
            onPress={() => setFilterType('income')}
          >
            <Text style={[
              styles.filterChipText,
              filterType === 'income' && styles.filterChipTextActive
            ]}>
              💰 Ingresos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterType === 'expense' && styles.filterChipActive]}
            onPress={() => setFilterType('expense')}
          >
            <Text style={[
              styles.filterChipText,
              filterType === 'expense' && styles.filterChipTextActive
            ]}>
              💸 Gastos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Summary */}
      {filteredTransactions.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Transacciones</Text>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>
              {stats.count}
            </Text>
          </View>
          {filterType !== 'expense' && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Ingresos</Text>
              <Text style={[styles.statValue, { color: colors.income }]}>
                {settings.currency.symbol}{stats.income.toFixed(2)}
              </Text>
            </View>
          )}
          {filterType !== 'income' && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Gastos</Text>
              <Text style={[styles.statValue, { color: colors.expense }]}>
                {settings.currency.symbol}{stats.expense.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Transaction List */}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Cargando...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {searchQuery ? '🔍' : '📝'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? `No se encontraron transacciones\ncon "${searchQuery}"`
                : 'No hay transacciones aún.\n¡Comienza agregando una!'}
            </Text>
          </View>
        ) : (
          groupedTransactions.map((group, groupIndex) => (
            <View key={groupIndex}>
              <Text style={styles.dateHeader}>{group.date}</Text>
              {group.transactions.map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => handleTransactionPress(transaction)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        visible={detailModalVisible}
        transaction={selectedTransaction}
        onDismiss={() => setDetailModalVisible(false)}
        onEdit={isFeatureEnabled('enableTransactionEdit') ? handleEditTransaction : undefined}
        onDelete={isFeatureEnabled('enableTransactionDelete') ? handleDeleteTransaction : undefined}
      />

      {/* Edit Transaction Modal */}
      <Modal
        visible={addTransactionVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseAddTransaction}
      >
        <AddTransactionScreen
          type={editingTransaction?.type || 'expense'}
          transaction={editingTransaction || undefined}
          onClose={handleCloseAddTransaction}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteDialogVisible}
        title="Eliminar Transacción"
        message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
        type="warning"
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              setDeleteDialogVisible(false);
              setTransactionToDelete(null);
            },
          },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: confirmDelete,
          },
        ]}
        onDismiss={() => {
          setDeleteDialogVisible(false);
          setTransactionToDelete(null);
        }}
      />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};
