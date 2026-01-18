import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DebtContextType, IDebt, DebtJSON, DebtType, DebtStatus } from '../types';

const DebtContext = createContext<DebtContextType | undefined>(undefined);

const DEBTS_STORAGE_KEY = '@Bolsio:debts';

export const DebtProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [debts, setDebts] = useState<IDebt[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar deudas desde AsyncStorage
  const loadDebts = async () => {
    try {
      setLoading(true);
      const storedDebts = await AsyncStorage.getItem(DEBTS_STORAGE_KEY);
      if (storedDebts) {
        const parsedDebts: DebtJSON[] = JSON.parse(storedDebts);
        const debtsWithDates = parsedDebts.map(debt => ({
          ...debt,
          date: new Date(debt.date),
          dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
          paidDate: debt.paidDate ? new Date(debt.paidDate) : undefined,
        }));
        setDebts(debtsWithDates);
      }
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar deudas en AsyncStorage
  const saveDebts = async (debtsToSave: IDebt[]) => {
    try {
      const debtsJSON: DebtJSON[] = debtsToSave.map(debt => ({
        ...debt,
        date: debt.date.toISOString(),
        dueDate: debt.dueDate?.toISOString(),
        paidDate: debt.paidDate?.toISOString(),
      }));
      await AsyncStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(debtsJSON));
    } catch (error) {
      console.error('Error saving debts:', error);
    }
  };

  // Agregar deuda
  const addDebt = async (debtData: Partial<IDebt>): Promise<boolean> => {
    try {
      const newDebt: IDebt = {
        id: Date.now().toString(),
        type: debtData.type || 'owed_to_me',
        person: debtData.person || '',
        amount: debtData.amount || 0,
        description: debtData.description || '',
        date: debtData.date || new Date(),
        dueDate: debtData.dueDate,
        status: debtData.status || 'pending',
        paidDate: debtData.paidDate,
      };

      const updatedDebts = [...debts, newDebt];
      setDebts(updatedDebts);
      await saveDebts(updatedDebts);
      return true;
    } catch (error) {
      console.error('Error adding debt:', error);
      return false;
    }
  };

  // Eliminar deuda
  const deleteDebt = async (id: string): Promise<boolean> => {
    try {
      const updatedDebts = debts.filter(debt => debt.id !== id);
      setDebts(updatedDebts);
      await saveDebts(updatedDebts);
      return true;
    } catch (error) {
      console.error('Error deleting debt:', error);
      return false;
    }
  };

  // Actualizar deuda
  const updateDebt = async (id: string, updatedData: Partial<IDebt>): Promise<boolean> => {
    try {
      const updatedDebts = debts.map(debt =>
        debt.id === id ? { ...debt, ...updatedData } : debt
      );
      setDebts(updatedDebts);
      await saveDebts(updatedDebts);
      return true;
    } catch (error) {
      console.error('Error updating debt:', error);
      return false;
    }
  };

  // Marcar deuda como pagada/cobrada
  const markDebtAsPaid = async (id: string): Promise<boolean> => {
    try {
      const updatedDebts = debts.map(debt =>
        debt.id === id
          ? { ...debt, status: 'paid' as DebtStatus, paidDate: new Date() }
          : debt
      );
      setDebts(updatedDebts);
      await saveDebts(updatedDebts);
      return true;
    } catch (error) {
      console.error('Error marking debt as paid:', error);
      return false;
    }
  };

  // Calcular total que me deben
  const getTotalOwedToMe = (): number => {
    return debts
      .filter(debt => debt.type === 'owed_to_me' && debt.status === 'pending')
      .reduce((total, debt) => total + debt.amount, 0);
  };

  // Calcular total que debo
  const getTotalOwedByMe = (): number => {
    return debts
      .filter(debt => debt.type === 'owed_by_me' && debt.status === 'pending')
      .reduce((total, debt) => total + debt.amount, 0);
  };

  // Obtener deudas por tipo
  const getDebtsByType = (type: DebtType): IDebt[] => {
    return debts.filter(debt => debt.type === type);
  };

  // Obtener deudas por estado
  const getDebtsByStatus = (status: DebtStatus): IDebt[] => {
    return debts.filter(debt => debt.status === status);
  };

  // Cargar deudas al iniciar
  useEffect(() => {
    loadDebts();
  }, []);

  const value: DebtContextType = {
    debts,
    loading,
    addDebt,
    deleteDebt,
    updateDebt,
    markDebtAsPaid,
    loadDebts,
    getTotalOwedToMe,
    getTotalOwedByMe,
    getDebtsByType,
    getDebtsByStatus,
  };

  return (
    <DebtContext.Provider value={value}>
      {children}
    </DebtContext.Provider>
  );
};

export const useDebts = (): DebtContextType => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebts must be used within a DebtProvider');
  }
  return context;
};