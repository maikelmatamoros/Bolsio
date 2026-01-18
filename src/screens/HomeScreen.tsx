import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';
import { isFeatureEnabled } from '../config/featureFlags';
import { Dialog } from '../components/common/Dialog';
import { FabMenu, FabMenuItem } from '../components/common/FabMenu';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { AddTransactionScreen } from './AddTransactionScreen';
import { TransferScreen } from './TransferScreen';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import { TransactionType, ITransaction } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NavigationProp {
  navigate: (screen: string, params?: { type?: TransactionType }) => void;
}

interface HomeScreenProps {
  navigation?: NavigationProp;
  onNavigate?: (screen: string, params?: any) => void;
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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<ITransaction | null>(null);

  const [fabMenuVisible, setFabMenuVisible] = useState(false);
  const [cardAnimations] = useState({
    // No hay animaciones de cards actualmente
  });

  // Función para obtener las categorías más usadas
  const getTopCategories = (limit: number) => {
    const categoryTotals: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        categoryTotals[t.category!] = (categoryTotals[t.category!] || 0) + t.amount;
      });
    
    return Object.entries(categoryTotals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  };

  // Función para obtener emoji de categoría
  const getCategoryEmoji = (categoryName: string) => {
    const emojiMap: { [key: string]: string } = {
      'Comida': '🍽️',
      'Transporte': '🚗',
      'Entretenimiento': '🎬',
      'Salud': '🏥',
      'Educación': '📚',
      'Ropa': '👕',
      'Casa': '🏠',
      'Servicios': '💡',
      'Viajes': '✈️',
      'Otros': '📦'
    };
    return emojiMap[categoryName] || '📦';
  };

  const balance = getTotalBalance();

  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
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

    return { income, expense, net: income - expense };
  }, [transactions]);

  // Calcular estadísticas totales
  const totalStats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, net: income - expense };
  }, [transactions]);



  const toggleFabMenu = () => {
    setFabMenuVisible(!fabMenuVisible);
  };

  const handleFabMenuItem = (action: 'income' | 'expense' | 'transfer') => {
    if (action === 'transfer') {
      setTransferVisible(true);
    } else {
      handleOpenAddTransaction(action);
    }
  };

  // FAB Menu Items
  const fabMenuItems: FabMenuItem[] = [
    {
      key: 'income',
      icon: 'trending-up',
      label: 'Ingreso',
      onPress: () => handleFabMenuItem('income'),
      backgroundColor: colors.income,
    },
    {
      key: 'expense',
      icon: 'trending-down',
      label: 'Gasto',
      onPress: () => handleFabMenuItem('expense'),
      backgroundColor: colors.expense,
    },
    {
      key: 'transfer',
      icon: 'swap-horizontal',
      label: 'Transferir',
      onPress: () => handleFabMenuItem('transfer'),
      backgroundColor: colors.primary,
    },
  ];

  const handleOpenAddTransaction = (type: TransactionType) => {
    setInitialTransactionType(type);
    setAddTransactionVisible(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      // Revertir balance de la cuenta
      if (transactionToDelete.type === 'transfer') {
        // Para transferencias, revertir en ambas cuentas
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
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -1,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.textMuted,
      marginTop: 4,
      fontWeight: '400',
    },

    // Cards principales
    card: {
      marginHorizontal: 20,
      marginVertical: 8,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    cardExpanded: {
      marginHorizontal: 16,
    },
    cardTouchable: {
      borderRadius: 20,
    },

    // Stats Grid
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 20,
      marginBottom: 8,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Expanded Content
    expandedContent: {
      marginTop: 16,
    },
    metricsSection: {
      marginTop: 20,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    metricItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // Categories Summary
    categoriesSummary: {
      marginBottom: 24,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    categoriesGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    categoryItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    categoryIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    categoryEmoji: {
      fontSize: 16,
    },
    categoryName: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    categoryAmount: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Empty Categories
    emptyCategories: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    emptyCategoriesIcon: {
      fontSize: 32,
      marginBottom: 8,
      opacity: 0.5,
    },
    emptyCategoriesText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },

    // Quick Actions
    actionsCard: {
      padding: 24,
    },
    actionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    actionsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      minWidth: '48%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.outline,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 4,
    },
    actionIcon: {
      fontSize: 28,
      marginBottom: 8,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },

    // Empty State
    emptyContainer: {
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 24,
    },

    // Quick Summary Card
    quickSummaryCard: {
      padding: 20,
    },
    quickSummaryHeader: {
      marginBottom: 16,
    },
    quickSummaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    quickSummaryGrid: {
      gap: 12,
    },
    quickSummaryRow: {
      flexDirection: 'row',
      gap: 12,
    },
    quickSummaryItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    quickSummaryItemFull: {
      alignItems: 'center',
      paddingVertical: 16,
      marginBottom: 8,
    },
    metricSection: {
      marginBottom: 16,
    },
    metricSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    quickSummaryValue: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    quickSummaryLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    quickSummarySublabel: {
      fontSize: 10,
      fontWeight: '400',
      textTransform: 'none',
      letterSpacing: 0,
      marginTop: 2,
    },
    motivationalContainer: {
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
    },
    motivationalText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 20,
    },

  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bolsio</Text>
          <Text style={styles.headerSubtitle}>Tu control financiero</Text>
        </View>

        {/* Quick Summary Card */}
        <View style={[styles.card, styles.quickSummaryCard]}>
          <View style={styles.quickSummaryHeader}>
            <Text style={styles.quickSummaryTitle}>📊 Resumen Rápido</Text>
          </View>

          <View style={styles.quickSummaryGrid}>
            {/* Primera fila: Balance Total */}
            <View style={[styles.quickSummaryItem, styles.quickSummaryItemFull]}>
              <Text style={[styles.quickSummaryValue, {
                color: balance >= 0 ? colors.income : colors.expense,
                fontSize: 28,
                fontWeight: '800'
              }]}>
                {balance === 0 ? '--' : formatCurrency(balance, settings.currency.symbol)}
              </Text>
              <Text style={styles.quickSummaryLabel}>Balance Total</Text>
              {balance === 0 && (
                <Text style={[styles.quickSummarySublabel, { color: colors.textMuted }]}>
                  No hay cuentas configuradas
                </Text>
              )}
            </View>

            {/* Segunda fila: Este mes */}
            <View style={styles.metricSection}>
              <Text style={styles.metricSectionTitle}>Este mes</Text>
              <View style={styles.quickSummaryRow}>
                <View style={styles.quickSummaryItem}>
                  <Text style={[styles.quickSummaryValue, { color: colors.income }]}>
                    {formatCurrency(currentMonthStats.income, settings.currency.symbol)}
                  </Text>
                  <Text style={styles.quickSummaryLabel}>Ingresos</Text>
                </View>

                <View style={styles.quickSummaryItem}>
                  <Text style={[styles.quickSummaryValue, { color: colors.expense }]}>
                    {formatCurrency(currentMonthStats.expense, settings.currency.symbol)}
                  </Text>
                  <Text style={styles.quickSummaryLabel}>Gastos</Text>
                </View>
              </View>
            </View>

            {/* Tercera fila: Total acumulado */}
            <View style={styles.metricSection}>
              <Text style={styles.metricSectionTitle}>Total acumulado</Text>
              <View style={styles.quickSummaryRow}>
                <View style={styles.quickSummaryItem}>
                  <Text style={[styles.quickSummaryValue, { color: colors.income, fontSize: 14 }]}>
                    {formatCurrency(totalStats.income, settings.currency.symbol)}
                  </Text>
                  <Text style={[styles.quickSummaryLabel, { fontSize: 10 }]}>Ingresos</Text>
                </View>

                <View style={styles.quickSummaryItem}>
                  <Text style={[styles.quickSummaryValue, { color: colors.expense, fontSize: 14 }]}>
                    {formatCurrency(totalStats.expense, settings.currency.symbol)}
                  </Text>
                  <Text style={[styles.quickSummaryLabel, { fontSize: 10 }]}>Gastos</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Motivational message */}
          <View style={styles.motivationalContainer}>
            <Text style={styles.motivationalText}>
              {balance > 0
                ? "¡Excelente! Tu balance es positivo 💪"
                : balance === 0
                ? "Comienza agregando tus cuentas 📱"
                : "Oportunidad de mejorar tu balance 📈"
              }
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button with Menu */}
      <FabMenu
        menuItems={fabMenuItems}
        visible={fabMenuVisible}
        onToggle={toggleFabMenu}
      />

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
