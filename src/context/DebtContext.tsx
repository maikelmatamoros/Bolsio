import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DebtContextType, IDebt, DebtJSON, DebtType, DebtStatus, IDebtPayment, DebtPaymentJSON } from '../types';
import { useTransactions } from './TransactionContext';
import { useAccounts } from './AccountContext';

const DebtContext = createContext<DebtContextType | undefined>(undefined);

export { DebtContext };

const DEBTS_STORAGE_KEY = '@Bolsio:debts';
const DEBT_PAYMENTS_STORAGE_KEY = '@Bolsio:debtPayments';

export const DebtProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [debts, setDebts] = useState<IDebt[]>([]);
  const [debtPayments, setDebtPayments] = useState<IDebtPayment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Obtener contexto de transacciones
  const transactionContext = useTransactions();
  const { accounts, updateAccountBalance, getAccountById } = useAccounts();

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
        id: debt.id,
        type: debt.type,
        person: debt.person,
        amount: debt.amount,
        description: debt.description,
        date: debt.date.toISOString(),
        dueDate: debt.dueDate?.toISOString(),
        status: debt.status,
        paidDate: debt.paidDate?.toISOString(),
      }));
      await AsyncStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(debtsJSON));
    } catch (error) {
      console.error('Error saving debts:', error);
    }
  };

  // Cargar pagos desde AsyncStorage
  const loadDebtPayments = async () => {
    try {
      const storedPayments = await AsyncStorage.getItem(DEBT_PAYMENTS_STORAGE_KEY);
      if (storedPayments) {
        const parsedPayments: DebtPaymentJSON[] = JSON.parse(storedPayments);
        const paymentsWithDates = parsedPayments.map(payment => ({
          ...payment,
          date: new Date(payment.date),
        }));
        setDebtPayments(paymentsWithDates);
      }
    } catch (error) {
      console.error('Error loading debt payments:', error);
    }
  };

  // Guardar pagos en AsyncStorage
  const saveDebtPayments = async (paymentsToSave: IDebtPayment[]) => {
    try {
      const paymentsJSON: DebtPaymentJSON[] = paymentsToSave.map(payment => ({
        ...payment,
        date: payment.date.toISOString(),
      }));
      await AsyncStorage.setItem(DEBT_PAYMENTS_STORAGE_KEY, JSON.stringify(paymentsJSON));
    } catch (error) {
      console.error('Error saving debt payments:', error);
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

  // Marcar deuda como pagada
  const markDebtAsPaid = async (id: string): Promise<boolean> => {
    return updateDebt(id, { status: 'paid', paidDate: new Date() });
  };

  // Agregar pago parcial
  const addDebtPayment = async (paymentData: Partial<IDebtPayment>): Promise<boolean> => {
    try {
      const newPayment: IDebtPayment = {
        id: Date.now().toString(),
        debtId: paymentData.debtId || '',
        amount: paymentData.amount || 0,
        date: paymentData.date || new Date(),
        accountId: paymentData.accountId || '',
        description: paymentData.description,
      };

      // Validar que la cuenta existe
      const account = getAccountById(newPayment.accountId);
      if (!account) {
        throw new Error('Cuenta no encontrada');
      }

      // Obtener la deuda
      const debt = debts.find(d => d.id === newPayment.debtId);
      if (!debt) {
        throw new Error('Deuda no encontrada');
      }

      // Validar saldo suficiente solo para pagos (deudas que uno debe)
      if (debt.type === 'owed_by_me') {
        if (account.balance < newPayment.amount) {
          throw new Error(`Saldo insuficiente. La cuenta ${account.name} tiene ${account.balance} pero se necesitan ${newPayment.amount}`);
        }
      }

      const updatedPayments = [...debtPayments, newPayment];
      setDebtPayments(updatedPayments);
      await saveDebtPayments(updatedPayments);

      // Crear transacción automática y actualizar balance
      if (transactionContext) {
        const transactionType = debt.type === 'owed_to_me' ? 'income' : 'expense';
        const category = debt.type === 'owed_to_me' ? 'debt_collection' : 'debt_payment';
        const description = `Pago de deuda: ${debt.description}`;

        const transactionSuccess = await transactionContext.addTransaction({
          type: transactionType,
          amount: newPayment.amount,
          category: category,
          description: description,
          date: newPayment.date,
          accountId: newPayment.accountId,
        });

        if (transactionSuccess) {
          // Actualizar balance de la cuenta
          const balanceOperation = debt.type === 'owed_to_me' ? 'add' : 'subtract';
          await updateAccountBalance(newPayment.accountId, newPayment.amount, balanceOperation);
        }
      }

      // Verificar si la deuda está completamente pagada
      const totalPaid = getTotalPaidForDebt(debt.id) + newPayment.amount;
      if (totalPaid >= debt.amount && debt.status === 'pending') {
        await markDebtAsPaid(debt.id);
      }

      return true;
    } catch (error) {
      console.error('Error adding debt payment:', error);
      throw error; // Re-lanzar el error para que sea manejado por el componente
    }
  };

  // Eliminar pago
  const deleteDebtPayment = async (paymentId: string): Promise<boolean> => {
    try {
      const payment = debtPayments.find(p => p.id === paymentId);
      if (!payment) {
        return false;
      }

      const updatedPayments = debtPayments.filter(p => p.id !== paymentId);
      setDebtPayments(updatedPayments);
      await saveDebtPayments(updatedPayments);

      // Obtener la deuda para determinar el tipo de transacción
      const debt = debts.find(d => d.id === payment.debtId);
      if (debt && transactionContext) {
        // Buscar y eliminar la transacción correspondiente
        const relatedTransaction = transactionContext.transactions.find(t =>
          t.accountId === payment.accountId &&
          t.amount === payment.amount &&
          Math.abs(t.date.getTime() - payment.date.getTime()) < 60000 && // Dentro de 1 minuto
          t.description.includes(`Pago de deuda: ${debt.description}`)
        );

        if (relatedTransaction) {
          await transactionContext.deleteTransaction(relatedTransaction.id);

          // Revertir el balance de la cuenta
          const balanceOperation = debt.type === 'owed_to_me' ? 'subtract' : 'add';
          await updateAccountBalance(payment.accountId, payment.amount, balanceOperation);
        }
      }

      // Si se elimina un pago, verificar si la deuda vuelve a estar pendiente
      if (debt && debt.status === 'paid') {
        const totalPaid = getTotalPaidForDebt(debt.id);
        if (totalPaid < debt.amount) {
          // Marcar como pendiente nuevamente
          const updatedDebts = debts.map(d =>
            d.id === debt.id
              ? { ...d, status: 'pending' as DebtStatus, paidDate: undefined }
              : d
          );
          setDebts(updatedDebts);
          await saveDebts(updatedDebts);
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting debt payment:', error);
      return false;
    }
  };

  // Calcular total que me deben (considerando pagos parciales)
  const getTotalOwedToMe = (): number => {
    return debts
      .filter(debt => debt.type === 'owed_to_me')
      .reduce((total, debt) => {
        const totalPaid = getTotalPaidForDebt(debt.id);
        return total + Math.max(0, debt.amount - totalPaid);
      }, 0);
  };

  // Calcular total que debo (considerando pagos parciales)
  const getTotalOwedByMe = (): number => {
    return debts
      .filter(debt => debt.type === 'owed_by_me')
      .reduce((total, debt) => {
        const totalPaid = getTotalPaidForDebt(debt.id);
        return total + Math.max(0, debt.amount - totalPaid);
      }, 0);
  };

  // Obtener total pagado para una deuda específica
  const getTotalPaidForDebt = (debtId: string): number => {
    return debtPayments
      .filter(payment => payment.debtId === debtId)
      .reduce((total, payment) => total + payment.amount, 0);
  };

  // Obtener pagos para una deuda específica
  const getPaymentsForDebt = (debtId: string): IDebtPayment[] => {
    return debtPayments
      .filter(payment => payment.debtId === debtId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Obtener saldo pendiente de una deuda
  const getDebtBalance = (debtId: string): number => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return 0;
    const totalPaid = getTotalPaidForDebt(debtId);
    return Math.max(0, debt.amount - totalPaid);
  };

  // Obtener deudas por tipo
  const getDebtsByType = (type: DebtType): IDebt[] => {
    return debts.filter(debt => debt.type === type);
  };

  // Obtener deudas por estado
  const getDebtsByStatus = (status: DebtStatus): IDebt[] => {
    return debts.filter(debt => debt.status === status);
  };

  // Cargar deudas y pagos al iniciar
  useEffect(() => {
    loadDebts();
    loadDebtPayments();
  }, []);

  const value: DebtContextType = {
    debts,
    debtPayments,
    loading,
    addDebt,
    deleteDebt,
    updateDebt,
    markDebtAsPaid,
    loadDebts,
    addDebtPayment,
    deleteDebtPayment,
    getTotalOwedToMe,
    getTotalOwedByMe,
    getTotalPaidForDebt,
    getPaymentsForDebt,
    getDebtBalance,
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