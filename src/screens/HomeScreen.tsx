import React, { useState } from 'react';
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
import { Card } from '../components/common/Card';
import { Dialog } from '../components/common/Dialog';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { AddTransactionScreen } from './AddTransactionScreen';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import { TransactionType, ITransaction } from '../types';

interface NavigationProp {
  navigate: (screen: string, params?: { type?: TransactionType }) => void;
}

interface HomeScreenProps {
  navigation?: NavigationProp;
  onNavigate?: (screen: 'Transactions') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, onNavigate }) => {
  const {
    transactions,
    loading,
    getBalance,
    getTotalIncome,
    getTotalExpense,
    deleteTransaction,
  } = useTransactions();
  const { updateAccountBalance } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();

  const [addTransactionVisible, setAddTransactionVisible] = useState(false);
  const [initialTransactionType, setInitialTransactionType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<ITransaction | null>(null);

  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();

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
    if (selectedTransaction) {
      setEditingTransaction(selectedTransaction);
      setInitialTransactionType(selectedTransaction.type);
      setDetailModalVisible(false);
      setAddTransactionVisible(true);
    }
  };

  const handleDeleteTransaction = () => {
    if (selectedTransaction) {
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
          <Text style={styles.balanceLabel}>Balance Total</Text>
          <Text style={[
            styles.balanceAmount,
            { color: balance >= 0 ? colors.income : colors.expense }
          ]}>
            {formatCurrency(balance, settings.currency.symbol)}
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Ingresos</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.income }]}>
                {formatCurrency(totalIncome, settings.currency.symbol)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Gastos</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.expense }]}>
                {formatCurrency(totalExpense, settings.currency.symbol)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
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

      {/* Modal de detalle de transacción */}
      <TransactionDetailModal
        visible={detailModalVisible}
        transaction={selectedTransaction}
        onDismiss={() => setDetailModalVisible(false)}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
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
