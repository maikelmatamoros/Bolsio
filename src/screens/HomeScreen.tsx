import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';
import { isFeatureEnabled } from '../config/featureFlags';
import { Card } from '../components/common/Card';
import { Dialog } from '../components/common/Dialog';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { AddTransactionScreen } from './AddTransactionScreen';
import { TransferScreen } from './TransferScreen';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import { TransactionType, ITransaction } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface NavigationProp {
  navigate: (screen: string, params?: { type?: TransactionType }) => void;
}

interface HomeScreenProps {
  navigation?: NavigationProp;
  onNavigate?: (screen: 'Home' | 'Transactions' | 'Settings') => void;
  quickActionsRef?: React.RefObject<any>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, onNavigate, quickActionsRef }) => {
  const {
    transactions,
    loading,
    getTotalIncome,
    getTotalExpense,
    deleteTransaction,
  } = useTransactions();
  const { updateAccountBalance, getTotalBalance } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [addTransactionVisible, setAddTransactionVisible] = useState(false);
  const [transferVisible, setTransferVisible] = useState(false);
  const [initialTransactionType, setInitialTransactionType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<ITransaction | null>(null);

  const balance = getTotalBalance();
  
  // Calcular ingresos y gastos del mes seleccionado
  const monthlyStats = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  }, [transactions, selectedMonth]);

  // Obtener las últimas 5 transacciones
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleOpenAddTransaction = (type: TransactionType) => {
    setInitialTransactionType(type);
    setAddTransactionVisible(true);
  };

  const handleTransactionPress = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const handleEditTransaction = () => {
    if (selectedTransaction && isFeatureEnabled('enableTransactionEdit')) {
      // No permitir editar transferencias por ahora
      if (selectedTransaction.type === 'transfer') {
        showToast('Las transferencias no se pueden editar');
        return;
      }
      setEditingTransaction(selectedTransaction);
      setInitialTransactionType(selectedTransaction.type);
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
      if (transactionToDelete.type === 'transfer') {
        // Para transferencias, revertir en ambas cuentas
        console.log('=== ELIMINANDO TRANSFERENCIA (HomeScreen) ===');
        console.log('Transaction:', JSON.stringify(transactionToDelete, null, 2));
        console.log('Cuenta origen (accountId):', transactionToDelete.accountId);
        console.log('Cuenta destino (destinationAccountId):', transactionToDelete.destinationAccountId);
        console.log('Monto:', transactionToDelete.amount);
        
        console.log('Devolviendo', transactionToDelete.amount, 'a cuenta origen');
        await updateAccountBalance(transactionToDelete.accountId, transactionToDelete.amount, 'add');
        
        if (transactionToDelete.destinationAccountId) {
          console.log('Quitando', transactionToDelete.amount, 'de cuenta destino');
          await updateAccountBalance(transactionToDelete.destinationAccountId, transactionToDelete.amount, 'subtract');
        } else {
          console.log('WARNING: No hay destinationAccountId!');
        }
      } else {
        const operation = transactionToDelete.type === 'income' ? 'subtract' : 'add';
        await updateAccountBalance(transactionToDelete.accountId, transactionToDelete.amount, operation);
      }

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
    scrollView: {
      flex: 1,
    },
    header: {
      padding: 16,
      paddingTop: 8,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 13,
      color: colors.textLight,
      marginTop: 2,
    },
    balanceCard: {
      marginHorizontal: 16,
      backgroundColor: colors.primaryContainer,
      padding: 20,
      marginTop: 8,
    },
    balanceLabel: {
      fontSize: 14,
      color: colors.onPrimaryContainer,
      opacity: 0.9,
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.onPrimaryContainer,
      marginVertical: 6,
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginTop: 8,
      paddingVertical: 8,
    },
    monthText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onPrimaryContainer,
      textTransform: 'capitalize',
      minWidth: 150,
      textAlign: 'center',
    },
    balanceDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: settings.theme === 'dark' ? 'rgba(234, 221, 255, 0.2)' : 'rgba(33, 0, 93, 0.2)',
    },
    balanceItem: {
      flex: 1,
    },
    balanceItemLabel: {
      fontSize: 12,
      color: colors.onPrimaryContainer,
      opacity: 0.8,
    },
    balanceItemAmount: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 4,
      color: colors.onPrimaryContainer,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginTop: 16,
      gap: 12,
    },
    quickActionButton: {
      flex: 1,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    quickActionIcon: {
      fontSize: 28,
      marginBottom: 6,
    },
    quickActionText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '600',
    },
    recentSection: {
      padding: 16,
      paddingTop: 12,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    seeAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textLight,
      fontSize: 16,
      padding: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bolsio</Text>
          <Text style={styles.headerSubtitle}>Control de Finanzas</Text>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Balance Total</Text>
            <Text style={[
              styles.balanceAmount,
              { color: balance >= 0 ? colors.income : colors.expense }
            ]}>
              {formatCurrency(balance, settings.currency.symbol)}
            </Text>
            
            {/* Month Selector */}
            <View style={styles.monthSelector}>
              <TouchableOpacity
                onPress={() => {
                  const newMonth = new Date(selectedMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setSelectedMonth(newMonth);
                }}
              >
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const newMonth = new Date(selectedMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setSelectedMonth(newMonth);
                }}
                disabled={selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear()}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear() 
                    ? colors.onSurfaceVariant 
                    : colors.primary
                  } 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.balanceDetails}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Ingresos</Text>
                <Text style={[styles.balanceItemAmount, { color: colors.income }]}>
                  {formatCurrency(monthlyStats.income, settings.currency.symbol)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Gastos</Text>
                <Text style={[styles.balanceItemAmount, { color: colors.expense }]}>
                  {formatCurrency(monthlyStats.expense, settings.currency.symbol)}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer} ref={quickActionsRef} collapsable={false}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.income }]}
            onPress={() => handleOpenAddTransaction('income')}
          >
            <Text style={styles.quickActionIcon}>💰</Text>
            <Text style={styles.quickActionText}>Nuevo Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.expense }]}
            onPress={() => handleOpenAddTransaction('expense')}
          >
            <Text style={styles.quickActionIcon}>💸</Text>
            <Text style={styles.quickActionText}>Nuevo Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
            onPress={() => setTransferVisible(true)}
          >
            <Text style={styles.quickActionIcon}>↔️</Text>
            <Text style={styles.quickActionText}>Transferir</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
            {transactions.length > 5 && (
              <TouchableOpacity onPress={() => onNavigate?.('Transactions')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <Text style={styles.emptyText}>Cargando...</Text>
          ) : recentTransactions.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                No hay transacciones aún.{'\n'}
                ¡Comienza agregando una!
              </Text>
            </Card>
          ) : (
            recentTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() => handleTransactionPress(transaction)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de agregar transacción */}
      <Modal
        visible={addTransactionVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseAddTransaction}
      >
        <AddTransactionScreen
          type={initialTransactionType}
          transaction={editingTransaction || undefined}
          onClose={handleCloseAddTransaction}
        />
      </Modal>

      {/* Modal de transferencia */}
      <Modal
        visible={transferVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTransferVisible(false)}
      >
        <TransferScreen
          onClose={() => setTransferVisible(false)}
        />
      </Modal>

      {/* Modal de detalle de transacción */}
      <TransactionDetailModal
        visible={detailModalVisible}
        transaction={selectedTransaction}
        onDismiss={() => setDetailModalVisible(false)}
        onEdit={isFeatureEnabled('enableTransactionEdit') ? handleEditTransaction : undefined}
        onDelete={isFeatureEnabled('enableTransactionDelete') ? handleDeleteTransaction : undefined}
      />

      {/* Diálogo de confirmación de eliminación */}
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
