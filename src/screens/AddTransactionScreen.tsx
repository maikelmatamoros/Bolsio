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
import { useCategories } from '../context/CategoryContext';
import { useSettings } from '../context/SettingsContext';
import { CategorySelectorModal } from '../components/CategorySelectorModal';
import { AccountSelectorModal } from '../components/AccountSelectorModal';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { lightColors, darkColors } from '../constants/colors';
import { TransactionType, ICategory, IAccount, ITransaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface AddTransactionScreenProps {
  type: TransactionType;
  transaction?: ITransaction; // Opcional: para modo edición
  onClose: () => void;
}

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  type,
  transaction,
  onClose,
}) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { accounts, updateAccountBalance } = useAccounts();
  const { getAllCategories } = useCategories();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [categorySelectorVisible, setCategorySelectorVisible] = useState(false);
  const [accountSelectorVisible, setAccountSelectorVisible] = useState(false);

  const isEditMode = !!transaction;

  // Cargar datos de la transacción si está en modo edición
  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setDate(new Date(transaction.date));
      
      // Encontrar categoría
      const categories = getAllCategories(transaction.type);
      const cat = categories.find(c => c.id === transaction.category);
      if (cat) setSelectedCategory(cat);
      
      // Encontrar cuenta
      const acc = accounts.find(a => a.id === transaction.accountId);
      if (acc) setSelectedAccount(acc);
    }
  }, [transaction]);

  const handleSave = async () => {
    // Validaciones
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      showToast('Ingresa un monto válido mayor a 0', 'error');
      return;
    }

    if (!selectedCategory) {
      showToast('Selecciona una categoría', 'error');
      return;
    }

    if (!selectedAccount) {
      showToast('Selecciona una cuenta', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Ingresa una descripción', 'error');
      return;
    }

    try {
      let success = false;

      if (isEditMode && transaction) {
        // Modo edición: revertir balance anterior y aplicar el nuevo
        const oldAmount = transaction.amount;
        const oldAccountId = transaction.accountId;
        
        // Revertir balance anterior
        const oldOperation = transaction.type === 'income' ? 'subtract' : 'add';
        await updateAccountBalance(oldAccountId, oldAmount, oldOperation);
        
        // Actualizar transacción
        success = await updateTransaction(transaction.id, {
          amount: amountNum,
          category: selectedCategory.id,
          description: description.trim(),
          date,
          accountId: selectedAccount.id,
        });
        
        if (success) {
          // Aplicar nuevo balance
          const newOperation = type === 'income' ? 'add' : 'subtract';
          await updateAccountBalance(selectedAccount.id, amountNum, newOperation);
        }
      } else {
        // Modo creación
        success = await addTransaction({
          type,
          amount: amountNum,
          category: selectedCategory.id,
          description: description.trim(),
          date,
          accountId: selectedAccount.id,
        });

        if (success) {
          // Actualizar balance de la cuenta
          const operation = type === 'income' ? 'add' : 'subtract';
          await updateAccountBalance(selectedAccount.id, amountNum, operation);
        }
      }

      if (success) {
        showToast(
          isEditMode 
            ? 'Transacción actualizada correctamente'
            : `${type === 'income' ? 'Ingreso' : 'Gasto'} registrado correctamente`,
          'success'
        );

        // Cerrar después de un delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showToast('Error al guardar la transacción', 'error');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      showToast('Error al guardar la transacción', 'error');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.onSurface,
    },
    content: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    amountContainer: {
      backgroundColor: type === 'income' ? colors.income : colors.expense,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
    },
    amountLabel: {
      fontSize: 14,
      color: '#fff',
      opacity: 0.9,
      marginBottom: 8,
    },
    amountInput: {
      fontSize: 48,
      fontWeight: '700',
      color: '#fff',
      minWidth: 200,
      textAlign: 'center',
    },
    selectorButton: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      minHeight: 60,
    },
    selectorContent: {
      flex: 1,
    },
    selectorLabel: {
      fontSize: 12,
      marginBottom: 4,
    },
    selectedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    selectedItemIcon: {
      fontSize: 20,
    },
    selectedItemText: {
      fontSize: 16,
      fontWeight: '500',
    },
    selectorPlaceholder: {
      fontSize: 16,
    },
    accountIconSmall: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountIconTextSmall: {
      fontSize: 16,
    },
    descriptionInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    dateText: {
      fontSize: 16,
      fontWeight: '500',
    },
    saveButton: {
      margin: 16,
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditMode 
            ? (type === 'income' ? '💰 Editar Ingreso' : '💸 Editar Gasto')
            : (type === 'income' ? '💰 Nuevo Ingreso' : '💸 Nuevo Gasto')
          }
        </Text>
        <IconButton 
          icon="close" 
          size={24} 
          onPress={onClose} 
          iconColor={colors.onSurfaceVariant} 
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Amount */}
        <View style={[styles.section, { paddingTop: 20 }]}>
          <Text style={styles.label}>Monto</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>
              {settings.currency.symbol}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.selectorButton, { backgroundColor: colors.surface, borderColor: colors.outline }]}
            onPress={() => {
              console.log('Opening category selector');
              setCategorySelectorVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.selectorContent}>
              <Text style={[styles.selectorLabel, { color: colors.onSurfaceVariant }]}>Categoría</Text>
              {selectedCategory ? (
                <View style={styles.selectedItem}>
                  <Text style={styles.selectedItemIcon}>{selectedCategory.icon}</Text>
                  <Text style={[styles.selectedItemText, { color: colors.onSurface }]}>
                    {selectedCategory.name}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.selectorPlaceholder, { color: colors.onSurfaceVariant }]}>
                  Seleccionar
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Selector */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.selectorButton, { backgroundColor: colors.surface, borderColor: colors.outline }]}
            onPress={() => {
              console.log('Opening account selector');
              setAccountSelectorVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.selectorContent}>
              <Text style={[styles.selectorLabel, { color: colors.onSurfaceVariant }]}>Cuenta</Text>
              {selectedAccount ? (
                <View style={styles.selectedItem}>
                  <View style={[styles.accountIconSmall, { backgroundColor: selectedAccount.color }]}>
                    <Text style={styles.accountIconTextSmall}>{selectedAccount.icon}</Text>
                  </View>
                  <Text style={[styles.selectedItemText, { color: colors.onSurface }]}>
                    {selectedAccount.name}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.selectorPlaceholder, { color: colors.onSurfaceVariant }]}>
                  Seleccionar
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[
              styles.descriptionInput,
              { 
                backgroundColor: colors.surface, 
                borderColor: colors.outline,
                color: colors.onSurface 
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Compra en supermercado"
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { backgroundColor: colors.surface, borderColor: colors.outline }
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateText, { color: colors.onSurface }]}>
              {date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: type === 'income' ? colors.income : colors.expense }
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Actualizar' : `Guardar ${type === 'income' ? 'Ingreso' : 'Gasto'}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Selector Modal */}
      <CategorySelectorModal
        visible={categorySelectorVisible}
        type={type}
        selectedCategoryId={selectedCategory?.id}
        onSelect={(category) => {
          console.log('Category selected:', category);
          setSelectedCategory(category);
          setCategorySelectorVisible(false);
        }}
        onDismiss={() => setCategorySelectorVisible(false)}
      />

      {/* Account Selector Modal */}
      <AccountSelectorModal
        visible={accountSelectorVisible}
        selectedAccountId={selectedAccount?.id}
        onSelect={(account) => {
          console.log('Account selected:', account);
          setSelectedAccount(account);
          setAccountSelectorVisible(false);
        }}
        onDismiss={() => setAccountSelectorVisible(false)}
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
