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

// Tipos para deudas
export type DebtType = 'owed_to_me' | 'owed_by_me';
export type DebtStatus = 'pending' | 'paid' | 'cancelled';
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

// Tipos para pagos de deudas
export interface IDebtPayment {
  id: string;
  debtId: string; // ID de la deuda a la que pertenece
  amount: number;
  date: Date;
  accountId: string; // ID de la cuenta donde se registra la transacción
  description?: string; // Descripción opcional del pago
}

export interface DebtPaymentJSON {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  accountId: string;
  description?: string;
}

export interface IDebt {
  id: string;
  type: DebtType;
  person: string; // Nombre de la persona
  amount: number;
  description: string;
  date: Date;
  dueDate?: Date; // Fecha de vencimiento opcional
  status: DebtStatus;
  paidDate?: Date; // Fecha en que se pagó/cobró
}

export interface DebtJSON {
  id: string;
  type: DebtType;
  person: string;
  amount: number;
  description: string;
  date: string;
  dueDate?: string;
  status: DebtStatus;
  paidDate?: string;
}

// Tipos para el contexto de deudas
export interface DebtContextType {
  debts: IDebt[];
  debtPayments: IDebtPayment[];
  loading: boolean;
  addDebt: (debtData: Partial<IDebt>) => Promise<boolean>;
  deleteDebt: (id: string) => Promise<boolean>;
  updateDebt: (id: string, updatedData: Partial<IDebt>) => Promise<boolean>;
  markDebtAsPaid: (id: string) => Promise<boolean>;
  loadDebts: () => Promise<void>;
  addDebtPayment: (paymentData: Partial<IDebtPayment>) => Promise<boolean>;
  deleteDebtPayment: (paymentId: string) => Promise<boolean>;
  getTotalOwedToMe: () => number;
  getTotalOwedByMe: () => number;
  getTotalPaidForDebt: (debtId: string) => number;
  getPaymentsForDebt: (debtId: string) => IDebtPayment[];
  getDebtBalance: (debtId: string) => number;
  getDebtsByType: (type: DebtType) => IDebt[];
  getDebtsByStatus: (status: DebtStatus) => IDebt[];
}
