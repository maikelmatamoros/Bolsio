import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AccountStorageService } from '../services/AccountStorageService';
import { Account } from '../models/Account';
import { AccountContextType, IAccount } from '../types';

const AccountContext = createContext<AccountContextType | undefined>(undefined);

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar cuentas al iniciar
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async (): Promise<void> => {
    setLoading(true);
    
    try {
      await AccountStorageService.initializeDefaultAccounts();
      const data = await AccountStorageService.getAccounts();
      
      // Filtrar duplicados por ID (por si acaso)
      const uniqueAccounts = data.filter((account, index, self) =>
        index === self.findIndex((a) => a.id === account.id)
      );
      
      setAccounts(uniqueAccounts);
    } catch (error) {
      console.error('[AccountContext] Error cargando cuentas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar cuenta
  const addAccount = async (accountData: Partial<IAccount>): Promise<boolean> => {
    const newAccount = new Account(accountData);
    const success = await AccountStorageService.addAccount(newAccount);
    if (success) {
      setAccounts(prev => [...prev, newAccount]);
    }
    return success;
  };

  // Eliminar cuenta
  const deleteAccount = async (id: string): Promise<boolean> => {
    const success = await AccountStorageService.deleteAccount(id);
    if (success) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
    return success;
  };

  // Actualizar cuenta
  const updateAccount = async (id: string, updatedData: Partial<IAccount>): Promise<boolean> => {
    const success = await AccountStorageService.updateAccount(id, updatedData);
    if (success) {
      await loadAccounts();
    }
    return success;
  };

  // Actualizar balance de cuenta
  const updateAccountBalance = async (
    id: string,
    amount: number,
    operation: 'add' | 'subtract'
  ): Promise<boolean> => {
    const success = await AccountStorageService.updateAccountBalance(id, amount, operation);
    if (success) {
      await loadAccounts();
    }
    return success;
  };

  // Obtener cuenta por ID
  const getAccountById = (id: string): IAccount | undefined => {
    return accounts.find(a => a.id === id);
  };

  // Obtener balance total de todas las cuentas
  const getTotalBalance = (): number => {
    try {
      if (loading || !accounts || accounts.length === 0) {
        return 0;
      }
      
      return accounts.reduce((acc, account) => {
        return acc + (Number(account?.balance) || 0);
      }, 0);
    } catch (error) {
      console.error('[AccountContext] Error calculando balance:', error);
      return 0;
    }
  };

  const value: AccountContextType = {
    accounts,
    loading,
    addAccount,
    deleteAccount,
    updateAccount,
    updateAccountBalance,
    loadAccounts,
    getAccountById,
    getTotalBalance,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAccounts = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts debe usarse dentro de AccountProvider');
  }
  return context;
};
