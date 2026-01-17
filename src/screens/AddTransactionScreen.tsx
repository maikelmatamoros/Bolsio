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
import { useCurrencyInput } from '../hooks/useCurrencyInput';
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

  const amountInput = useCurrencyInput(0);
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
      amountInput.setValue(transaction.amount);
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
    if (amountInput.numericValue <= 0) {
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
          amount: amountInput.numericValue,
          category: selectedCategory.id,
          description: description.trim(),
          date,
          accountId: selectedAccount.id,
        });
        
        if (success) {
          // Aplicar nuevo balance
          const newOperation = type === 'income' ? 'add' : 'subtract';
          await updateAccountBalance(selectedAccount.id, amountInput.numericValue, newOperation);
        }
      } else {
        // Modo creación
        success = await addTransaction({
          type,
          amount: amountInput.numericValue,
          category: selectedCategory.id,
          description: description.trim(),
          date,
          accountId: selectedAccount.id,
        });

        if (success) {
          // Actualizar balance de la cuenta
          const operation = type === 'income' ? 'add' : 'subtract';
          await updateAccountBalance(selectedAccount.id, amountInput.numericValue, operation);
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
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingTop: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.onSurface,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    rowSection: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 12,
    },
    halfSection: {
      flex: 1,
    },
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
      marginBottom: 6,
    },
    amountContainer: {
      backgroundColor: type === 'income' ? colors.income : colors.expense,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 4,
    },
    amountLabel: {
      fontSize: 12,
      color: '#fff',
      opacity: 0.8,
      marginBottom: 4,
    },
    amountInput: {
      fontSize: 32,
      fontWeight: '700',
      color: '#fff',
      minWidth: 150,
      textAlign: 'center',
    },
    selectorButton: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      minHeight: 48,
    },
    selectorContent: {
      flex: 1,
    },
    selectorLabel: {
      fontSize: 11,
      marginBottom: 2,
    },
    selectedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    selectedItemIcon: {
      fontSize: 16,
    },
    selectedItemText: {
      fontSize: 14,
      fontWeight: '500',
    },
    selectorPlaceholder: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    accountIconSmall: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    accountIconTextSmall: {
      fontSize: 12,
    },
    descriptionInput: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      minHeight: 80,
      textAlignVertical: 'top',
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
      fontSize: 14,
      fontWeight: '500',
    },
    saveButton: {
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditMode 
            ? (type === 'income' ? 'Editar Ingreso' : 'Editar Gasto')
            : (type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto')
          }
        </Text>
        <IconButton 
          icon="close" 
          size={24} 
          onPress={onClose} 
          iconColor={colors.onSurfaceVariant} 
        />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Amount */}
        <View style={[styles.section, { paddingTop: 12 }]}>
          <Text style={styles.label}>Monto</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>
              {settings.currency.symbol}
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amountInput.displayValue}
              onChangeText={amountInput.handleChange}
              placeholder="0.00"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Category and Account Row */}
        <View style={styles.rowSection}>
          {/* Category Selector */}
          <View style={styles.halfSection}>
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
          <View style={styles.halfSection}>
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
            placeholder="Descripción"
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
            {isEditMode ? 'Actualizar' : 'Guardar'}
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
