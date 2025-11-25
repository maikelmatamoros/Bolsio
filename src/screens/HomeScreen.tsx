import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTransactions } from '../context/TransactionContext';
import { Card } from '../components/common/Card';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import { TransactionType } from '../types';

interface NavigationProp {
  navigate: (screen: string, params?: { type: TransactionType }) => void;
}

interface HomeScreenProps {
  navigation: NavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const {
    transactions,
    loading,
    getBalance,
    getTotalIncome,
    getTotalExpense,
  } = useTransactions();

  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpense = getTotalExpense();

  // Obtener las últimas 5 transacciones
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MoneyTrack</Text>
          <Text style={styles.headerSubtitle}>Control de Finanzas</Text>
        </View>

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Balance Total</Text>
          <Text style={[
            styles.balanceAmount,
            { color: balance >= 0 ? colors.income : colors.expense }
          ]}>
            {formatCurrency(balance)}
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Ingresos</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.income }]}>
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Gastos</Text>
              <Text style={[styles.balanceItemAmount, { color: colors.expense }]}>
                {formatCurrency(totalExpense)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.income }]}
            onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
          >
            <Text style={styles.actionButtonIcon}>💰</Text>
            <Text style={styles.actionButtonText}>Ingreso</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.expense }]}
            onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
          >
            <Text style={styles.actionButtonIcon}>💸</Text>
            <Text style={styles.actionButtonText}>Gasto</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
            {transactions.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('TransactionsList')}>
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
                onPress={() => {}}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  balanceCard: {
    marginHorizontal: 16,
    backgroundColor: colors.primary,
    padding: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginVertical: 8,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
  },
  balanceItemAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
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
