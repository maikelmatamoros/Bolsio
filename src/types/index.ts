// Tipos para las transacciones
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface ITransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
  accountId: string; // ID de la cuenta donde se registra
  destinationAccountId?: string; // Solo para transferencias: cuenta destino
}

export interface TransactionJSON {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  accountId: string;
  destinationAccountId?: string; // Solo para transferencias: cuenta destino
}

// Tipos para cuentas/sobres
export type AccountType = 'bank' | 'cash' | 'card' | 'digital';

export interface IAccount {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface AccountJSON {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  icon: string;
  color: string;
  isActive: boolean;
}

// Tipos para categorías
export interface ICategory {
  id: string;
  name: string;
  icon: string;
}

export interface ICategories {
  income: ICategory[];
  expense: ICategory[];
}

// Tipos para validación
export interface ValidationErrors {
  type?: string;
  amount?: string;
  category?: string;
  description?: string;
  accountId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Tipos para el contexto de transacciones
export interface TransactionContextType {
  transactions: ITransaction[];
  loading: boolean;
  addTransaction: (transactionData: Partial<ITransaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  updateTransaction: (id: string, updatedData: Partial<ITransaction>) => Promise<boolean>;
  loadTransactions: () => Promise<void>;
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getTransactionsByType: (type: TransactionType) => ITransaction[];
  getTransactionsByCategory: (category: string) => ITransaction[];
  getTransactionsByAccount: (accountId: string) => ITransaction[];
}

// Tipos para el contexto de cuentas
export interface AccountContextType {
  accounts: IAccount[];
  loading: boolean;
  addAccount: (accountData: Partial<IAccount>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
  updateAccount: (id: string, updatedData: Partial<IAccount>) => Promise<boolean>;
  updateAccountBalance: (id: string, amount: number, operation: 'add' | 'subtract') => Promise<boolean>;
  loadAccounts: () => Promise<void>;
  clearAllAccounts: () => Promise<void>;
  getAccountById: (id: string) => IAccount | undefined;
  getTotalBalance: () => number;
}
