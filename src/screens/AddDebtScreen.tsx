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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDebts } from '../context/DebtContext';
import { useSettings } from '../context/SettingsContext';
import { Toast } from '../components/common/Toast';
import { useToast } from '../hooks/useToast';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import { lightColors, darkColors } from '../constants/colors';
import { DebtType, IDebt } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface AddDebtScreenProps {
  type: DebtType;
  debt?: IDebt; // Opcional: para modo edición
  onClose: () => void;
}

export const AddDebtScreen: React.FC<AddDebtScreenProps> = ({
  type,
  debt,
  onClose,
}) => {
  const { addDebt, updateDebt } = useDebts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  const { toast, showToast, hideToast } = useToast();

  const amountInput = useCurrencyInput(0);
  const [person, setPerson] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const isEditMode = !!debt;

  // Cargar datos de la deuda si está en modo edición
  useEffect(() => {
    if (debt) {
      amountInput.setValue(debt.amount);
      setPerson(debt.person);
      setDescription(debt.description);
      setDate(new Date(debt.date));
      setDueDate(debt.dueDate ? new Date(debt.dueDate) : undefined);
    }
  }, [debt]);

  const handleSave = async () => {
    // Validaciones
    if (amountInput.numericValue <= 0) {
      showToast('Ingresa un monto válido mayor a 0', 'error');
      return;
    }

    if (!person.trim()) {
      showToast('Ingresa el nombre de la persona', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Ingresa una descripción', 'error');
      return;
    }

    try {
      let success = false;

      if (isEditMode && debt) {
        // Modo edición
        success = await updateDebt(debt.id, {
          person: person.trim(),
          amount: amountInput.numericValue,
          description: description.trim(),
          date,
          dueDate,
        });
      } else {
        // Modo creación
        success = await addDebt({
          type,
          person: person.trim(),
          amount: amountInput.numericValue,
          description: description.trim(),
          date,
          dueDate,
        });
      }

      if (success) {
        showToast(
          isEditMode
            ? 'Deuda actualizada correctamente'
            : 'Deuda registrada correctamente',
          'success'
        );

        // Cerrar después de un delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showToast('Error al guardar la deuda', 'error');
      }
    } catch (error) {
      console.error('Error saving debt:', error);
      showToast('Error al guardar la deuda', 'error');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    setShowDueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
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
    label: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
      marginBottom: 6,
    },
    amountContainer: {
      backgroundColor: type === 'owed_to_me'
        ? (settings.theme === 'dark' ? '#1e293b' : colors.income)
        : (settings.theme === 'dark' ? '#1e293b' : colors.expense),
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 4,
      borderWidth: settings.theme === 'dark' ? 1 : 0,
      borderColor: settings.theme === 'dark'
        ? (type === 'owed_to_me' ? '#10b981' : '#ef4444')
        : undefined,
    },
    amountLabel: {
      fontSize: 12,
      color: settings.theme === 'dark' ? '#94a3b8' : '#fff',
      opacity: settings.theme === 'dark' ? 1 : 0.8,
      marginBottom: 4,
    },
    amountInput: {
      fontSize: 32,
      fontWeight: '700',
      color: settings.theme === 'dark' ? '#f1f5f9' : '#fff',
      minWidth: 150,
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      minHeight: 48,
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
      minHeight: 48,
    },
    dateText: {
      fontSize: 14,
      fontWeight: '500',
    },
    clearDueDateButton: {
      padding: 4,
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
            ? 'Editar Deuda'
            : (type === 'owed_to_me' ? 'Nueva Deuda (Me deben)' : 'Nueva Deuda (Debo)')
          }
        </Text>
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
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
              placeholderTextColor={settings.theme === 'dark' ? '#64748b' : 'rgba(255, 255, 255, 0.6)'}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Person */}
        <View style={styles.section}>
          <Text style={styles.label}>Persona</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                color: colors.onSurface
              }
            ]}
            value={person}
            onChangeText={setPerson}
            placeholder="Nombre de la persona"
            placeholderTextColor={colors.onSurfaceVariant}
          />
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
            placeholder="Descripción de la deuda"
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            numberOfLines={3}
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

        {/* Due Date */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.label}>Fecha de vencimiento (opcional)</Text>
            {dueDate && (
              <TouchableOpacity
                style={styles.clearDueDateButton}
                onPress={() => setDueDate(undefined)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { backgroundColor: colors.surface, borderColor: colors.outline }
            ]}
            onPress={() => setShowDueDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateText, { color: dueDate ? colors.onSurface : colors.onSurfaceVariant }]}>
              {dueDate
                ? dueDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Seleccionar fecha'
              }
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {showDueDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDueDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: type === 'owed_to_me' ? colors.income : colors.expense }
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Actualizar' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

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