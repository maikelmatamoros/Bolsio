import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDebts } from '../context/DebtContext';
import { useSettings } from '../context/SettingsContext';
import { useThemeColors } from '../hooks/useThemeColors';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

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
  const remainingBalance = getDebtBalance(debtId);

  const amountInput = useCurrencyInput(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (paymentAmount > remainingBalance) {
      Alert.alert(
        'Monto excedido',
        `El monto no puede ser mayor al saldo pendiente de ${formatCurrency(remainingBalance, settings.currency.symbol)}`
      );
      return;
    }

    try {
      await addDebtPayment({
        debtId,
        amount: paymentAmount,
        date,
        description: description.trim() || 'Pago parcial',
      });

      Alert.alert('Éxito', 'Pago registrado correctamente', [
        {
          text: 'OK',
          onPress: () => onNavigate?.('Debts'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el pago');
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
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});