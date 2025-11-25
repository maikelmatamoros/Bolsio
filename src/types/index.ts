// Tipos para las transacciones
export type TransactionType = 'income' | 'expense';

export interface ITransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export interface TransactionJSON {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
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
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Tipos para el contexto
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
}
