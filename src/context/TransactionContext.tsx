import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { StorageService } from '../services/StorageService';
import { Transaction } from '../models/Transaction';
import { TransactionContextType, ITransaction, TransactionType } from '../types';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar transacciones al iniciar
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await StorageService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('[TransactionContext] Error cargando transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar transacción
  const addTransaction = async (transactionData: Partial<ITransaction>): Promise<boolean> => {
    const newTransaction = new Transaction(transactionData);
    const success = await StorageService.addTransaction(newTransaction);
    if (success) {
      setTransactions(prev => [...prev, newTransaction]);
    }
    return success;
  };

  // Eliminar transacción
  const deleteTransaction = async (id: string): Promise<boolean> => {
    const success = await StorageService.deleteTransaction(id);
    if (success) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
    return success;
  };

  // Actualizar transacción
  const updateTransaction = async (id: string, updatedData: Partial<ITransaction>): Promise<boolean> => {
    const success = await StorageService.updateTransaction(id, updatedData);
    if (success) {
      await loadTransactions(); // Recargar datos
    }
    return success;
  };

  // Obtener balance total (sin contar transferencias)
  const getBalance = (): number => {
    try {
      if (!transactions || transactions.length === 0) {
        return 0;
      }
      
      return transactions.reduce((acc, transaction) => {
        // Las transferencias no afectan el balance total
        if (transaction.type === 'transfer') {
          return acc;
        }
        if (transaction.type === 'income') {
          return acc + transaction.amount;
        } else {
          return acc - transaction.amount;
        }
      }, 0);
    } catch (error) {
      console.error('[TransactionContext] Error en getBalance:', error);
      return 0;
    }
  };

  // Obtener total de ingresos
  const getTotalIncome = (): number => {
    try {
      if (!transactions || transactions.length === 0) {
        return 0;
      }
      return transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
    } catch (error) {
      console.error('[TransactionContext] Error en getTotalIncome:', error);
      return 0;
    }
  };

  // Obtener total de gastos
  const getTotalExpense = (): number => {
    try {
      if (!transactions || transactions.length === 0) {
        return 0;
      }
      return transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
    } catch (error) {
      console.error('[TransactionContext] Error en getTotalExpense:', error);
      return 0;
    }
  };

  // Obtener transacciones filtradas por tipo
  const getTransactionsByType = (type: TransactionType): ITransaction[] => {
    return transactions.filter(t => t.type === type);
  };

  // Obtener transacciones por categoría
  const getTransactionsByCategory = (category: string): ITransaction[] => {
    return transactions.filter(t => t.category === category);
  };

  // Obtener transacciones por cuenta (incluyendo transferencias)
  const getTransactionsByAccount = (accountId: string): ITransaction[] => {
    return transactions.filter(t => 
      t.accountId === accountId || t.destinationAccountId === accountId
    );
  };

  const value: TransactionContextType = {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    loadTransactions,
    getBalance,
    getTotalIncome,
    getTotalExpense,
    getTransactionsByType,
    getTransactionsByCategory,
    getTransactionsByAccount,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions debe usarse dentro de TransactionProvider');
  }
  return context;
};
