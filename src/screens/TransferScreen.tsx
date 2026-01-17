import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactions } from '../context/TransactionContext';
import { useAccounts } from '../context/AccountContext';
import { useSettings } from '../context/SettingsContext';
import { AccountSelectorModal } from '../components/AccountSelectorModal';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { lightColors, darkColors } from '../constants/colors';
import { IAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface TransferScreenProps {
  onClose: () => void;
}

export const TransferScreen: React.FC<TransferScreenProps> = ({ onClose }) => {
  const { addTransaction } = useTransactions();
  const { accounts, updateAccount, updateAccountBalance, loadAccounts } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();

  const amountInput = useCurrencyInput(0);
  const [sourceAccount, setSourceAccount] = useState<IAccount | null>(null);
  const [destinationAccount, setDestinationAccount] = useState<IAccount | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSourceAccountSelector, setShowSourceAccountSelector] = useState(false);
  const [showDestinationAccountSelector, setShowDestinationAccountSelector] = useState(false);

  const activeAccounts = accounts.filter(acc => acc.isActive);

  // Seleccionar primera cuenta activa como origen por defecto
  useEffect(() => {
    if (activeAccounts.length > 0 && !sourceAccount) {
      setSourceAccount(activeAccounts[0]);
    }
  }, [activeAccounts.length]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSourceAccountSelect = (account: IAccount) => {
    setSourceAccount(account);
    setShowSourceAccountSelector(false);
    // Si la cuenta destino es la misma que la origen, limpiarla
    if (destinationAccount?.id === account.id) {
      setDestinationAccount(null);
    }
  };

  const handleDestinationAccountSelect = (account: IAccount) => {
    setDestinationAccount(account);
    setShowDestinationAccountSelector(false);
  };

  const handleTransfer = async () => {
    if (!sourceAccount) {
      showToast('Selecciona una cuenta origen');
      return;
    }

    if (!destinationAccount) {
      showToast('Selecciona una cuenta destino');
      return;
    }

    if (sourceAccount.id === destinationAccount.id) {
      showToast('La cuenta origen y destino deben ser diferentes');
      return;
    }

    if (amountInput.numericValue <= 0) {
      showToast('El monto debe ser mayor a cero');
      return;
    }

    if (sourceAccount.balance < amountInput.numericValue) {
      showToast('Saldo insuficiente en la cuenta origen');
      return;
    }

    try {
      // Crear transacción de transferencia
      const newTransaction = {
        type: 'transfer' as const,
        amount: amountInput.numericValue,
        category: 'Transferencia',
        description: description || `Transferencia a ${destinationAccount.name}`,
        date,
        accountId: sourceAccount.id,
        destinationAccountId: destinationAccount.id,
      };

      // Crear la transacción primero
      const transactionCreated = await addTransaction(newTransaction);
      
      if (!transactionCreated) {
        showToast('Error al crear la transferencia');
        return;
      }

      // Actualizar balances usando updateAccountBalance
      const sourceUpdated = await updateAccountBalance(
        sourceAccount.id,
        amountInput.numericValue,
        'subtract'
      );
      
      const destUpdated = await updateAccountBalance(
        destinationAccount.id,
        amountInput.numericValue,
        'add'
      );

      if (!sourceUpdated || !destUpdated) {
        showToast('Error al actualizar los balances de las cuentas');
        // Aquí idealmente deberíamos revertir la transacción creada
        return;
      }

      // Recargar cuentas
      await loadAccounts();

      showToast('Transferencia registrada exitosamente');
      
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error al registrar transferencia:', error);
      showToast('Error al registrar la transferencia');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <IconButton
          icon="close"
          size={24}
          iconColor={colors.text}
          onPress={onClose}
        />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Nueva Transferencia
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Monto */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Monto</Text>
          <View style={[styles.amountContainer, { 
            backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#eff6ff', 
            borderColor: settings.theme === 'dark' ? '#334155' : '#3b82f6', 
            borderWidth: 1 
          }]}>
            <Text style={[styles.currencySymbol, { 
              color: settings.theme === 'dark' ? '#94a3b8' : '#1e40af' 
            }]}>
              {settings.currency.symbol}
            </Text>
            <TextInput
              style={[styles.amountInput, { 
                color: settings.theme === 'dark' ? '#f1f5f9' : '#1e40af' 
              }]}
              value={amountInput.displayValue}
              onChangeText={amountInput.handleChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={settings.theme === 'dark' ? '#64748b' : '#94a3b8'}
              maxLength={15}
            />
          </View>
        </View>

        {/* Cuenta Origen */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Desde</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline }]}
            onPress={() => setShowSourceAccountSelector(true)}
          >
            {sourceAccount ? (
              <View style={styles.accountInfo}>
                <View style={[styles.accountIconContainer, { backgroundColor: sourceAccount.color }]}>
                  <Text style={styles.accountIcon}>{sourceAccount.icon}</Text>
                </View>
                <View style={styles.accountDetails}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {sourceAccount.name}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.selectorPlaceholder, { color: colors.onSurfaceVariant }]}>
                Seleccionar cuenta origen
              </Text>
            )}
            <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Cuenta Destino */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Hacia</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline }]}
            onPress={() => setShowDestinationAccountSelector(true)}
            disabled={!sourceAccount}
          >
            {destinationAccount ? (
              <View style={styles.accountInfo}>
                <View style={[styles.accountIconContainer, { backgroundColor: destinationAccount.color }]}>
                  <Text style={styles.accountIcon}>{destinationAccount.icon}</Text>
                </View>
                <View style={styles.accountDetails}>
                  <Text style={[styles.accountName, { color: colors.text }]}>
                    {destinationAccount.name}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.selectorPlaceholder, { color: colors.onSurfaceVariant }]}>
                Seleccionar cuenta destino
              </Text>
            )}
            <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
            Descripción (opcional)
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderWidth: 1, borderColor: colors.outline, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 40 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Pago de deuda..."
            placeholderTextColor={colors.onSurfaceVariant}
            maxLength={100}
          />
        </View>

        {/* Fecha */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Fecha</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={[styles.selectorText, { color: colors.text }]}>
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </ScrollView>

      {/* Botón de Transferir */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.transferButton,
            { backgroundColor: colors.primary },
            (!sourceAccount || !destinationAccount || amountInput.numericValue <= 0) && styles.transferButtonDisabled
          ]}
          onPress={handleTransfer}
          disabled={!sourceAccount || !destinationAccount || amountInput.numericValue <= 0}
        >
          <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
          <Text style={styles.transferButtonText}>Transferir</Text>
        </TouchableOpacity>
      </View>

      {/* Modales */}
      <AccountSelectorModal
        visible={showSourceAccountSelector}
        onDismiss={() => setShowSourceAccountSelector(false)}
        onSelect={handleSourceAccountSelect}
        selectedAccountId={sourceAccount?.id}
      />

      <AccountSelectorModal
        visible={showDestinationAccountSelector}
        excludeAccountId={sourceAccount?.id}
        onDismiss={() => setShowDestinationAccountSelector(false)}
        onSelect={handleDestinationAccountSelect}
        selectedAccountId={destinationAccount?.id}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
  },
  selectorPlaceholder: {
    fontSize: 16,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountIcon: {
    fontSize: 16,
  },
  accountDetails: {
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
  transferIconContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  transferIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  transferButtonDisabled: {
    opacity: 0.5,
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
