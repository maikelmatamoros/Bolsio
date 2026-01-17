import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCategories } from '../../context/CategoryContext';
import { useAccounts } from '../../context/AccountContext';
import { useSettings } from '../../context/SettingsContext';
import { lightColors, darkColors } from '../../constants/colors';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';
import { ITransaction } from '../../types';

interface TransactionItemProps {
  transaction: ITransaction;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  onPress, 
  onLongPress 
}) => {
  const { getAllCategories } = useCategories();
  const { accounts } = useAccounts();
  const { settings } = useSettings();
  const colors = settings.theme === 'dark' ? darkColors : lightColors;
  
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const amountColor = isTransfer ? colors.primary : (isIncome ? colors.income : colors.expense);
  const sign = isIncome ? '+' : '-';

  // Para transferencias, obtener cuenta destino
  let categoryIcon = '💰';
  let categoryName = transaction.category;
  let displayDescription = transaction.description;

  if (isTransfer) {
    categoryIcon = '↔️';
    const destinationAccount = accounts.find(acc => acc.id === transaction.destinationAccountId);
    categoryName = 'Transferencia';
    displayDescription = destinationAccount 
      ? `→ ${destinationAccount.name}` 
      : transaction.description;
  } else {
    // Encontrar la categoría (predefinida o custom) solo para income/expense
    const allCategories = getAllCategories(transaction.type);
    const categoryData = allCategories.find(cat => cat.id === transaction.category);
    categoryIcon = categoryData?.icon || '💰';
    categoryName = categoryData?.name || transaction.category;
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginVertical: 4,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outline,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      fontSize: 24,
      marginRight: 10,
    },
    info: {
      flex: 1,
    },
    category: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 1,
    },
    description: {
      fontSize: 13,
      color: colors.onSurfaceVariant,
      marginBottom: 1,
    },
    date: {
      fontSize: 11,
      color: colors.onSurfaceVariant,
      opacity: 0.8,
    },
    rightSection: {
      alignItems: 'flex-end',
    },
    amount: {
      fontSize: 16,
      fontWeight: '700',
    },
  });

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.icon}>{categoryIcon}</Text>
          <View style={styles.info}>
            <Text style={styles.category} numberOfLines={1}>
              {categoryName}
            </Text>
            <Text style={styles.description} numberOfLines={1}>
              {displayDescription || 'Sin descripción'}
            </Text>
            <Text style={styles.date}>{formatRelativeDate(transaction.date)}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isTransfer ? '' : sign}{formatCurrency(transaction.amount, settings.currency.symbol)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
