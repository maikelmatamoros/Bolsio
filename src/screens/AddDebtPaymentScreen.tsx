import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDebts } from '../context/DebtContext';
import { useSettings } from '../context/SettingsContext';
import { useAccounts } from '../context/AccountContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/common/Toast';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { IAccount } from '../types';

interface RouteParams {
  debtId: string;
}

interface AddDebtPaymentScreenProps {
  debtId?: string;
  onNavigate?: (screen: string, params?: any) => void;
}

export default function AddDebtPaymentScreen({ debtId, onNavigate }: AddDebtPaymentScreenProps) {
  const { debts, addDebtPayment, getDebtBalance } = useDebts();
  const { settings } = useSettings();
  const { accounts } = useAccounts();
  const colors = useThemeColors();
  const { toast, showToast, hideToast } = useToast();

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
  const remainingBalance = getDebtBalance(debtId);

  const amountInput = useCurrencyInput(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  if (!debt) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Deuda no encontrada
        </Text>
      </View>
    );
  }

  const handleSave = async () => {
    const paymentAmount = amountInput.numericValue;

    if (!paymentAmount || paymentAmount <= 0) {
      showToast('Por favor ingresa un monto válido', 'error');
      return;
    }

    if (!selectedAccount) {
      showToast('Por favor selecciona una cuenta', 'error');
      return;
    }

    if (paymentAmount > remainingBalance) {
      showToast(`El monto no puede ser mayor al saldo pendiente de ${formatCurrency(remainingBalance, settings.currency.symbol)}`, 'error');
      return;
    }

    try {
      await addDebtPayment({
        debtId,
        amount: paymentAmount,
        date,
        accountId: selectedAccount.id,
        description: description.trim() || 'Pago parcial',
      });

      showToast(
        'Pago registrado correctamente',
        'success',
        'OK',
        () => {
          // Navegar al tab correspondiente según el tipo de deuda
          onNavigate?.('Debts', { selectedTab: debt.type });
        },
        false, // No auto-hide
        'bottom' // Mostrar abajo
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo registrar el pago';
      showToast(errorMessage, 'error');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.('Debts')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Agregar Pago
        </Text>
      </View>

      <View style={[styles.debtInfo, { backgroundColor: colors.card }]}>
        <Text style={[styles.debtTitle, { color: colors.text }]}>
          {debt.description}
        </Text>
        <Text style={[styles.debtAmount, { color: colors.primary }]}>
          Saldo pendiente: {formatCurrency(remainingBalance, settings.currency.symbol)}
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Monto del pago *
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={amountInput.displayValue}
            onChangeText={amountInput.handleChange}
            placeholder={`0 ${settings.currency.symbol}`}
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Cuenta *
          </Text>
          <TouchableOpacity
            style={[styles.accountButton, { borderColor: colors.border }]}
            onPress={() => setShowAccountPicker(true)}
          >
            <View style={styles.accountContent}>
              {selectedAccount ? (
                <>
                  <Text style={[styles.accountEmoji]}>{selectedAccount.icon}</Text>
                  <Text style={[styles.accountText, { color: colors.text }]}>
                    {selectedAccount.name}
                  </Text>
                </>
              ) : (
                <Text style={[styles.accountPlaceholder, { color: colors.textSecondary }]}>
                  Seleccionar cuenta
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Fecha del pago *
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>
              {date.toLocaleDateString('es-ES')}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        <Modal
          visible={showAccountPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAccountPicker(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAccountPicker(false)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Seleccionar Cuenta
              </Text>
            </View>

            <FlatList
              data={accounts.filter(account => account.isActive)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.accountItem, { backgroundColor: colors.card }]}
                  onPress={() => {
                    setSelectedAccount(item);
                    setShowAccountPicker(false);
                  }}
                >
                  <Text style={styles.accountEmoji}>{item.icon}</Text>
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.accountBalance, { color: colors.textSecondary }]}>
                      {formatCurrency(item.balance, settings.currency.symbol)}
                    </Text>
                  </View>
                  {selectedAccount?.id === item.id && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.accountList}
            />
          </View>
        </Modal>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Descripción (opcional)
          </Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción del pago"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
            Registrar Pago
          </Text>
        </TouchableOpacity>
      </View>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        actionButtonText={toast.actionButtonText}
        onAction={toast.onAction}
        autoHide={toast.autoHide}
        position={toast.position}
      />
    </ScrollView>
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
  debtInfo: {
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
    marginBottom: 8,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  accountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  accountText: {
    fontSize: 16,
  },
  accountPlaceholder: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCloseButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  accountList: {
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});