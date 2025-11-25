import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { colors } from '../../constants/colors';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';
import { categories } from '../../constants/categories';
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
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const sign = isIncome ? '+' : '-';

  // Encontrar la categoría para mostrar el ícono
  const categoryList = isIncome ? categories.income : categories.expense;
  const categoryData = categoryList.find(cat => cat.id === transaction.category);
  const categoryIcon = categoryData?.icon || '💰';
  const categoryName = categoryData?.name || transaction.category;

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <Card>
        <View style={styles.container}>
          <View style={styles.leftSection}>
            <Text style={styles.icon}>{categoryIcon}</Text>
            <View style={styles.info}>
              <Text style={styles.category}>{categoryName}</Text>
              <Text style={styles.description} numberOfLines={1}>
                {transaction.description}
              </Text>
              <Text style={styles.date}>{formatRelativeDate(transaction.date)}</Text>
            </View>
          </View>
          <View style={styles.rightSection}>
            <Text style={[styles.amount, { color: amountColor }]}>
              {sign} {formatCurrency(transaction.amount)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
});
