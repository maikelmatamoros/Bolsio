import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDebts } from '../context/DebtContext';
import { useSettings } from '../context/SettingsContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface RouteParams {
  debtId: string;
}

interface DebtPaymentHistoryScreenProps {
  debtId?: string;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function DebtPaymentHistoryScreen({ debtId, onNavigate }: DebtPaymentHistoryScreenProps) {
  const { debts, getPaymentsForDebt, deleteDebtPayment, getDebtBalance } = useDebts();
  const { settings } = useSettings();
  const colors = useThemeColors();

  if (!debtId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          ID de deuda no proporcionado
        </Text>
      </View>
    );
  }

  const debt = debts.find(d => d.id === debtId);
  const payments = getPaymentsForDebt(debtId);
  const remainingBalance = getDebtBalance(debtId);

  if (!debt) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Deuda no encontrada
        </Text>
      </View>
    );
  }

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      'Eliminar pago',
      '¿Estás seguro de que quieres eliminar este pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteDebtPayment(paymentId),
        },
      ]
    );
  };

  const renderPayment = ({ item }: { item: any }) => (
    <View style={[styles.paymentItem, { backgroundColor: colors.card }]}>
      <View style={styles.paymentHeader}>
        <Text style={[styles.paymentAmount, { color: colors.primary }]}>
          {formatCurrency(item.amount, settings.currency.symbol)}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePayment(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.paymentDate, { color: colors.textSecondary }]}>
        {new Date(item.date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>

      {item.description && (
        <Text style={[styles.paymentDescription, { color: colors.text }]}>
          {item.description}
        </Text>
      )}
    </View>
  );

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.('Debts')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Historial de Pagos
        </Text>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.card }]}>
        <Text style={[styles.debtTitle, { color: colors.text }]}>
          {debt.description}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total de la deuda:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(debt.amount, settings.currency.symbol)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Total pagado:
          </Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatCurrency(totalPaid, settings.currency.symbol)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Saldo pendiente:
          </Text>
          <Text style={[styles.summaryValue, { color: remainingBalance > 0 ? colors.error : colors.success }]}>
            {formatCurrency(remainingBalance, settings.currency.symbol)}
          </Text>
        </View>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay pagos registrados
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debtTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  paymentItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  paymentDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});